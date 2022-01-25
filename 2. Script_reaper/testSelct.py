from reaper_python import *
import requests

URL = "http://localhost:3000/files"

cuantos = RPR_CountSelectedMediaItems(0)
if cuantos != 1:
    RPR_ShowMessageBox("Select only one", "ERROR", 0)
else:
    item = RPR_GetSelectedMediaItem( 0, 0 )
    dur = RPR_GetMediaItemInfo_Value(item, "D_LENGTH")
    if dur > 5:
        RPR_ShowMessageBox("audios shorter than 5 secs", "ERROR", 0)
    else:
        take = RPR_GetMediaItemTake(item, 0) #asumimos una toma
        source = RPR_GetMediaItemTake_Source(take)
        sourceArray = RPR_GetMediaSourceFileName(source, "", 512)
        #RPR_ShowMessageBox(sourceArray[1], "INFO", 0)
        sample_file = open(sourceArray[1], "rb")
        upload_file = {"file": sample_file}
        r = requests.post("http://localhost:3000/texturabasica", files = upload_file)
        textureurl = r.json()["url"]

        URLAUDIO = textureurl;
        r = requests.get(url = "http://localhost:3000/files/" + URLAUDIO)
        open(URLAUDIO, 'wb').write(r.content) #lo pone en home
        RPR_InsertMedia(URLAUDIO,0)
        RPR_ShowMessageBox("audio has been generrated", "DONE", 0)
