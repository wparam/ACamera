package com.example.acamera;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Camera;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.util.Size;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.core.content.ContextCompat;

import com.google.firebase.crashlytics.buildtools.utils.FileUtils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;

public class AutoCapture {
    @SuppressLint("StaticFieldLeak")
    private static AutoCapture mInstance;

    @SuppressLint("StaticFieldLeak")
    private static FrameLayout mSurfaceViewFrame;

    Activity mContext;
    private static Camera mCamera;
    private static final HttpClient httpClient = HttpClient.getInstance();

    static String TAG = AutoCapture.class.getSimpleName();
    static int Interval = 20; // take pic every 10s

    private AutoCapture(Activity context)
    {
        this.mContext = context;
    }

    public synchronized static AutoCapture getInstance(Activity context)
    {
        if(mInstance ==null)
        {
            mInstance = new AutoCapture(context);

        }
        return mInstance;
    }

    public void initView(FrameLayout surfaceViewFrame)
    {
        mSurfaceViewFrame = surfaceViewFrame;
    }

    Handler mHandler = new Handler(Looper.myLooper())
    {
        @Override
        public void handleMessage(Message msg) {
            switch(msg.what)
            {
                case 1:
                    initCamera();
                    break;
                case 2:
                    if(mCamera==null){
                        return;
                    }

                    mCamera.autoFocus(new Camera.AutoFocusCallback() {

                        @Override
                        public void onAutoFocus(boolean success, Camera camera) {
                            // 从Camera捕获图片
                            Log.v(TAG, "--->: 自动聚焦: "+success);
                            mCamera.takePicture(null, null, mPicture);

                        }
                    });
                    break;
            }
        }
    };

    public void start()
    {
        mHandler.sendEmptyMessageDelayed(1, 5*1000); //xs 后拍照
    }

    private void initCamera()
    {
        Log.v(TAG, "--->: 初始化相机");
        if(mCamera==null)
        {
            Log.v(TAG, "--->: 相机为空, 尝试获取摄像头");
            mCamera = getCameraInstance();
            CameraPreview mPreview = new CameraPreview(mContext, mCamera);
            mSurfaceViewFrame.removeAllViews();
            mSurfaceViewFrame.addView(mPreview);
        }
        Log.v(TAG, mCamera==null ? "--->: 摄像头获取失败" : "相机初始化成功!");
        mCamera.startPreview();
        mHandler.sendEmptyMessageDelayed(2, 5*1000);
    }

    public static Camera getCameraInstance() {
        Camera c = null;
        try {
            c = openFrontFacingCameraGingerbread();
            c.setDisplayOrientation(90);
            Camera.Parameters mParameters = c.getParameters();

            //可以用得到当前所支持的照片大小，然后
            List<Camera.Size> ms = mParameters.getSupportedPictureSizes();
            mParameters.setPictureSize(ms.get(0).width, ms.get(0).height);  //默认最大拍照取最大清晰度的照片
            c.setParameters(mParameters);
        } catch (Exception e) {
            Log.d(TAG, "--->: 打开Camera失败");
        }
        return c;
    }

    private final Camera.PictureCallback mPicture = new Camera.PictureCallback() {

        @Override
        public void onPictureTaken(byte[] data, Camera camera) {
            // 获取Jpeg图片，并保存在sd卡上
            String path = Environment.getExternalStorageDirectory().getAbsolutePath() +"/acdata/";
            File dirF = new File(path);

            if(ContextCompat.checkSelfPermission(mContext, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED)
            {
                Toast.makeText(mContext, "未获得外部存储写权限" + path, Toast.LENGTH_SHORT).show();
                return;
            }

            if(!dirF.exists())
            {
                dirF.mkdirs();
            }
            long curSize = dirSize(dirF);
            if(curSize > 1024 * 1024 * 50){   //50mb
                for(File existFile : dirF.listFiles()){
                    existFile.delete();
                }
            }else{
                Log.d(TAG, "--->: 存储状态正常, 当前使用空间: " + String.valueOf(curSize) );
            }

            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss",
                    Locale.getDefault()).format(new Date());
            String filePath = path + "IMG_" + timeStamp + ".jpg";
            File pictureFile = new File(filePath);
            try {
                FileOutputStream fos = new FileOutputStream(pictureFile);
                fos.write(data);
                fos.close();
                Log.d(TAG, "--->: 保存图片成功");
            } catch (Exception e) {
                Log.d(TAG, "--->: 保存图片失败");
                e.printStackTrace();
                Toast.makeText(mContext, "无法保存图片:" + path, Toast.LENGTH_SHORT).show();
            }
            try{
                //currently not uploading
                uploadImage(filePath);
                Log.d(TAG, "--->: 开始上传图片...");
            }catch(Exception e){
                Log.d(TAG, "--->: 上传图片失败");
            }
            releaseCamera();
        }
    };

    public void uploadImage(String filepath){
        File file = new File(filepath);
        Api api = httpClient.getMyApi();
        RequestBody requestFile = RequestBody.create(MediaType.parse("multipart/form-data"), file);
        MultipartBody.Part uploadFileBody = MultipartBody.Part.createFormData("image", file.getName(), requestFile);
        Call<JsonObject> call = api.uploadFile(uploadFileBody);
        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, retrofit2.Response<JsonObject> response) {
                JSONObject jsonObject = null;
                try {
                    jsonObject = new JSONObject(new Gson().toJson(response.body()));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                try {
                    String result = jsonObject.getString("result");
                    Log.d("Upload", "--->: 结果 = " + result);
                    Toast.makeText(mContext, "当次检查结束, 是否发现然然:" + result == "false" ? "没看到" : "看到了", Toast.LENGTH_SHORT).show();
                    mHandler.sendEmptyMessageDelayed(1, Interval*1000);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                Log.d("Upload","failure: " + t.getMessage());
            }
        });
    }

    private static long dirSize(File dir) {
        if (dir.exists()) {
            long result = 0;
            File[] fileList = dir.listFiles();
            if (fileList != null) {
                for(int i = 0; i < fileList.length; i++) {
                    // Recursive call if it's a directory
                    if(fileList[i].isDirectory()) {
                        result += dirSize(fileList[i]);
                    } else {
                        // Sum the file size in bytes
                        result += fileList[i].length();
                    }
                }
            }
            return result; // return the file size
        }
        return 0;
    }

    public static Camera openFrontFacingCameraGingerbread() {
        int cameraCount = 0;
        Camera cam = null;
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        cameraCount = Camera.getNumberOfCameras();

        for (int camIdx = 0; camIdx < cameraCount; camIdx++) {
            Camera.getCameraInfo(camIdx, cameraInfo);
            if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                try {
                    cam = Camera.open(camIdx);
                } catch (RuntimeException e) {
                    Log.e(TAG, "Camera failed to open: " + e.getLocalizedMessage());
                }
            }
        }

        return cam;
    }

    public void releaseCamera()
    {
        if(mCamera!=null){
            mCamera.stopPreview();
            mCamera.release();
            mCamera=null;
        }
    }


}
