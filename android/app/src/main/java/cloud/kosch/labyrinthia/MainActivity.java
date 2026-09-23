package cloud.kosch.labyrinthia;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.util.Locale;

public class MainActivity extends Activity implements SensorEventListener {
    private WebView webView;
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private boolean motionEnabled = false;
    private WebViewAssetLoader assetLoader;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(0xFF070918);
        getWindow().setNavigationBarColor(0xFF070918);
        enterFullscreen();

        webView = new WebView(this);
        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        configureWebView(webView);
        setContentView(webView);

        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " LabyrinthiaAndroid/2.2.0");
        view.setWebViewClient(new WebViewClientCompat() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });
        view.setWebChromeClient(new WebChromeClient());
        view.addJavascriptInterface(new MotionBridge(), "LabyrinthiaAndroid");
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
        view.setBackgroundColor(0xFF070918);
    }

    private void enterFullscreen() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterFullscreen();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (!motionEnabled || webView == null || event.sensor.getType() != Sensor.TYPE_ACCELEROMETER) return;
        final float x = event.values[0];
        final float y = event.values[1];
        final float z = event.values[2];
        final String script = String.format(Locale.US,
                "window.LabyrinthiaNativeMotion && window.LabyrinthiaNativeMotion(%f,%f,%f);", x, y, z);
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }

    private final class MotionBridge {
        @JavascriptInterface
        public void setMotionEnabled(boolean enabled) {
            motionEnabled = enabled;
            if (sensorManager == null || accelerometer == null) return;
            if (enabled) sensorManager.registerListener(MainActivity.this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
            else sensorManager.unregisterListener(MainActivity.this, accelerometer);
        }
    }
}
