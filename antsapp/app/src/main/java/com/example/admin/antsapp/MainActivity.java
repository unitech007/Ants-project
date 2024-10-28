package com.example.admin.antsapp;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    private final String ANTS_URL = "YOUR_ANTS_URL";
    private final static int PICK_FILE_REQUEST_CODE = 0;
    private ValueCallback<Uri[]> mFilePathCallback;
    private ProgressBar antsPB;
    private ImageView antsIV;
    private WebView antsWV;
    private LinearLayout antsProgressFaviconLL;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initFields();
        antsWV.setWebViewClient(new WebViewClient(){

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                antsProgressFaviconLL.setVisibility(View.VISIBLE);
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                antsProgressFaviconLL.setVisibility(View.GONE);
                super.onPageFinished(view, url);
            }
        });
        antsWV.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                antsPB.setProgress(newProgress);
            }

            @Override
            public void onReceivedIcon(WebView view, Bitmap icon) {
                super.onReceivedIcon(view, icon);
                antsIV.setImageBitmap(icon);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                super.onReceivedTitle(view, title);
                getSupportActionBar().setTitle(title);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                mFilePathCallback = filePathCallback;
                String[] mimeTypes = {"image/jpeg", "image/jpg", "image/png"};
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("image/*").putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);;
                startActivityForResult(intent, PICK_FILE_REQUEST_CODE);
                return true;
            }
        });
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        if (requestCode == PICK_FILE_REQUEST_CODE) {
            Uri result = data == null || resultCode != RESULT_OK ? null:data.getData();
            Uri []resultsArray = new Uri[1];
            resultsArray[0] = result;
            mFilePathCallback.onReceiveValue(resultsArray);
        }
    }
    public void initFields() {
        antsPB = findViewById(R.id.antsProgressBar);
        antsIV = findViewById(R.id.antsFaviconImageView);
        antsWV = findViewById(R.id.antsWebView);
        antsWV.findNext(true);
        antsProgressFaviconLL = findViewById(R.id.antsProgressFaviconLL);
        antsPB.setMax(100);
        antsWV.loadUrl(ANTS_URL);
        antsWV.getSettings().setJavaScriptEnabled(true);
        antsWV.getSettings().setBuiltInZoomControls(true);
        antsWV.getSettings().setAllowFileAccess(true);
    }

    @Override
    public void onBackPressed() {
        if(antsWV.canGoBack()){
            antsWV.goBack();
        }else{
            finish();
        }
    }

    private void onForwardPressed() {
        if(antsWV.canGoForward()){
            antsWV.goForward();
        }else{
            Toast.makeText(this, "Can't go any further!", Toast.LENGTH_SHORT).show();
        }
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater menuInflater = getMenuInflater();
        menuInflater.inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()){
            case R.id.menu_back:
                onBackPressed();
                break;
            case R.id.menu_forward:
                onForwardPressed();
                break;
            case R.id.menu_refresh:
                antsWV.reload();
                break;
        }
        return super.onOptionsItemSelected(item);
    }
}
