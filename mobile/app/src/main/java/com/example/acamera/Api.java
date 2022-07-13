package com.example.acamera;

import com.google.gson.JsonObject;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public interface Api {
    String BASE_URL = "http://47.100.233.102:3001";

    @GET("/")
    Call<ResponseBody> getPingpong();

    @Multipart
    @POST("/image")
    Call<JsonObject> uploadFile(
        @Part MultipartBody.Part image
    );
}
