package com.example.acamera;

import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.hardware.Camera;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;

public class MainActivity extends AppCompatActivity {

    Camera camera;
    FrameLayout frameLayout;
//    CameraPreview showCamera;

    private static final String TAG = "ACameraLog";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // 创建预览类，并与Camera关联，最后添加到界面布局中
        frameLayout = (FrameLayout) this.findViewById(R.id.funFactLayout);
        Button captureButton = (Button) findViewById(R.id.button_capture);
        captureButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 在捕获图片前进行自动对焦
            }
        });
        //创建定时拍照任务
        AutoCapture ac = AutoCapture.getInstance(MainActivity.this);
        ac.initView((FrameLayout) frameLayout);
        ac.start();


        //open the camera
//        camera = openFrontFacingCameraGingerbread();
//
//        showCamera = new ShowCamera(this, camera);
//        frameLayout.addView(showCamera);
    }

    @Override
    protected void onDestroy() {
        // 回收Camera资源
        super.onDestroy();
        AutoCapture.getInstance(MainActivity.this).releaseCamera();
    }

}