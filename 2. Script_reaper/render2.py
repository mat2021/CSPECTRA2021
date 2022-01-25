from reaper_python import *

cuantos = RPR_CountSelectedMediaItems(0)
if cuantos != 1:
    RPR_ShowMessageBox("Select only one", "ERROR", 0)
else:
    item = RPR_GetSelectedMediaItem( 0, 0 )
    take = RPR_GetMediaItemTake(item, 0) #asumimos una toma

    dur = RPR_GetMediaItemInfo_Value(item, "D_LENGTH")

    loopInf = RPR_GetSet_LoopTimeRange2(0, 0, 0, 0, 0, 0)
    loopStart = loopInf[3]
    loopEnd = loopInf[4]
    loopSize = loopInf[4] - loopInf[3]
    pos = RPR_GetMediaItemInfo_Value(item, "D_POSITION")
    startOff = RPR_GetMediaItemTakeInfo_Value(take, "D_STARTOFFS")
    psource  =RPR_GetMediaItemTakeInfo_Value(take, "P_SOURCE")
    #Estos son los que incorpore
    source = RPR_GetMediaItemTake_Source(take);
    SourceLeng =  RPR_GetMediaSourceLength (source,0)
    offSet = RPR_GetMediaItemTakeInfo_Value(take, "D_STARTOFFSET")

    largo = dur+pos

    if loopSize > 5:
        RPR_ShowMessageBox("Audios más grandes que 5 segundos", "ERROR", 0)
    else:
        source = RPR_GetMediaItemTake_Source(take)
        sourceArray = RPR_GetMediaSourceFileName(source, "", 512)
        #RPR_RenderFileSection(sourceArray[1], "copiaidentica.wav",0.75,1,1)
        RPR_ShowConsoleMsg(sourceArray[1])
        RPR_ShowConsoleMsg(' Loop: ' + str(loopStart) + ' to ' + str(loopEnd))
        RPR_ShowConsoleMsg(' POS: ' + str(pos))
        RPR_ShowConsoleMsg(' SNAP: ' + str(startOff))
        RPR_ShowConsoleMsg(' SIZE: ' + str(loopSize))
        RPR_ShowConsoleMsg(' PSource: ' + str(psource))
        RPR_ShowConsoleMsg(' SourceLeng: ' + str(SourceLeng))
        RPR_ShowConsoleMsg(' OffSet: ' + str(offSet))
        RPR_ShowConsoleMsg(' LargoPista: ' + str(largo))






        
