from reaper_python import *
import requests
import uuid

URL = "http://localhost:3000/files"

cuantos = RPR_CountSelectedMediaItems(0)
if cuantos != 1:
    RPR_ShowMessageBox("Selecione uno", "ERROR", 0)
else:
    item = RPR_GetSelectedMediaItem( 0, 0 )
    take = RPR_GetMediaItemTake(item, 0) 

    durToma = RPR_GetMediaItemInfo_Value(item, "D_LENGTH")

    loopInf = RPR_GetSet_LoopTimeRange2(0, 0, 0, 0, 0, 0)
    loopStart = loopInf[3]
    loopEnd = loopInf[4]
    loopSize = loopInf[4] - loopInf[3]
    pos = RPR_GetMediaItemInfo_Value(item, "D_POSITION")
    startOff = RPR_GetMediaItemTakeInfo_Value(take, "D_STARTOFFS")

    if loopSize > 5:
        RPR_ShowMessageBox("Audios deben ser más cortos a 5 secs", "ERROR", 0)
    else:
        source = RPR_GetMediaItemTake_Source(take)
        durAudio = RPR_GetMediaSourceLength(source, False)[0];
        sourceArray = RPR_GetMediaSourceFileName(source, "", 512)
        norInit = (loopStart + pos - startOff) / durAudio;
        norEnd = (loopEnd + pos - startOff)  / durAudio;
        #uiid (Identificador Universalmente Único)
        nombreTMP = str(uuid.uuid4()) + ".wav"
        RPR_RenderFileSection(sourceArray[1], nombreTMP, norInit,norEnd,1)

        sample_file = open(nombreTMP, "rb")
        upload_file = {"file": sample_file}
        r = requests.post("http://localhost:3000/texturabasica", files = upload_file)
        textureurl = r.json()["url"]

        URLAUDIO = textureurl;
        r = requests.get(url = "http://localhost:3000/files/" + URLAUDIO)
        open(URLAUDIO, 'wb').write(r.content) #lo pone en home
        RPR_InsertMedia(URLAUDIO,0)

        RPR_ShowConsoleMsg(sourceArray[1]+ "\n")
        RPR_ShowConsoleMsg('DURTOMA: ' + str(durToma)+ "\n")
        RPR_ShowConsoleMsg('DURAUDIO: ' + str(durAudio)+ "\n")
        RPR_ShowConsoleMsg('Loop: ' + str(loopStart) + ' to ' + str(loopEnd) + "\n")
        RPR_ShowConsoleMsg('POS: ' + str(pos)+ "\n")
        RPR_ShowConsoleMsg('SNAP: ' + str(startOff)+ "\n")
        RPR_ShowConsoleMsg('INIT: ' + str(norInit)+ "\n")
        RPR_ShowConsoleMsg('END: ' + str(norEnd)+ "\n")
        RPR_ShowConsoleMsg("audio ha sido generado")
