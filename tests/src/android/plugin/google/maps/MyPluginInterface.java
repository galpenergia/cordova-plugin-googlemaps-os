package plugin.google.maps;

import com.google.android.libraries.maps.GoogleMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

public interface MyPluginInterface {
  public void initialize(CordovaInterface cordova, CordovaWebView webView);
  public void setMap(GoogleMap map);
  public boolean execute(String action, String rawArgs, CallbackContext callbackContext) throws JSONException;
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException;
  public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException;
}
