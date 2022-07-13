
package com.example.acamera;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;

public final class LooperThread extends Thread {
    private static Handler handler; // in Android Handler should be static or leaks might occur
    private HandlerCallback handlerCallback;

    public LooperThread() {
    }

    public LooperThread(HandlerCallback handlerCallback) {
        this.handlerCallback = handlerCallback;
    }

    @Override public void run() {
        Log.v("Looper", "start the running process");
        // Note: Looper is usually already created in the Activity
        boolean looperIsNotPreparedInCurrentThread = Looper.myLooper() == null;

        if (looperIsNotPreparedInCurrentThread) {
            Looper.prepare();
        }

        handler = new Handler(Looper.myLooper()) {
            public void handleMessage(Message message) {
                Log.d(getClass().getSimpleName(), message.getData().toString());

                if (handlerCallback != null) {
                    // note: we can avoid this callback by using event bus depending on concrete use case
                    handlerCallback.handleMessage(message);
                }
            }
        };

        if (looperIsNotPreparedInCurrentThread) {
            Looper.loop();
        }
    }

    public static void post(Runnable runnable) {
        if(handler != null ){
            handler.post(runnable);
        }
    }

    public static void send(Message message) {
        if(handler != null ) {
            handler.sendMessage(message);
        }
    }

    public static void sendEmptyMessageDelayed(int what, long delayMills) {
        if(handler != null ) {
            handler.sendEmptyMessageDelayed(what, delayMills);
        }
    }
}