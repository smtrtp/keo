package com.kaomoji.keyboard;

import android.inputmethodservice.InputMethodService;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class KaomojiKeyboardService extends InputMethodService {
    private WebView keyboardWebView;

    public class ServiceBridge {
        @JavascriptInterface
        public void commit(String text) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null && text != null) {
                ic.commitText(text, 1);
            }
        }

        @JavascriptInterface
        public void backspace() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                CharSequence selected = ic.getSelectedText(0);
                if (selected != null && selected.length() > 0) {
                    ic.commitText("", 1);
                } else {
                    ic.deleteSurroundingText(1, 0);
                }
            }
        }

        @JavascriptInterface
        public void enter() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                sendDownUpKeyEvents(KeyEvent.KEYCODE_ENTER);
            }
        }
    }

    @Override
    public View onCreateInputView() {
        keyboardWebView = new WebView(this);
        WebSettings settings = keyboardWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        keyboardWebView.addJavascriptInterface(new ServiceBridge(), "KeyboardService");
        keyboardWebView.setWebViewClient(new WebViewClient());
        keyboardWebView.loadUrl("file:///android_asset/web/index.html");

        return keyboardWebView;
    }
}
