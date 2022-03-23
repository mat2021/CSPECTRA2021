
**CSpectra2021**
[Herramienta de comparación de similitudes espectrales]
***

![](https://ottocastro.com/doctorado/images/cspectra.jpg)
![](https://ottocastro.com/images/README/01.jpg width="375")

**Descripción**
Esta investigación propone el uso del **CSpectra2021** como herramienta tecnológica de asistencia a la composición musical, con el fin de confrontar y complementar la escucha del compositor mediante la escucha de máquina. En esta tarea se implementa el aprendizaje supervisado, desde un sistema informático, con el propósito de encontrar similitudes tímbricas entre grabaciones de sonidos urbanos. Posteriormente, dichos sonidos serán organizados desde la escucha del compositor de manera estratégica para la composición musical.

***
Esta herramienta está construida a través del entorno de *Node.js* utilizando el lenguaje *JavaScript* para el desarrollo del servidor. Se utiliza un *script* escrito en el lenguaje de programación de *Python*, el cual sirve de puente de comunicación con el servidor. 

**Tareas de la herramienta**

- **Segmenta**:
Los sonidos que entran al sistema
- **Analiza**:
A través de un conjunto de descriptores acústicos espectrales 
- **Agrega**: 
Los sonidos por su similaridad espectral
- **Concatena**: 
Crea una textura sonora con los sonidos similares que devuelve al multipistas de Reaper. 

**Instalación**
Esta sección explica como poner instalar el servidor de forma local, es decir en su computadora personal. Debe instalar [Node.js](https://nodejs.org/) 12 o superior, [git](https://git-scm.com/downloads) 3.35 o superior y [Python](https://www.python.org/downloads/) 3.10 o superior

**1.** Primero clone el proyecto de [CSpectra2021](https://github.com/mat2021/CSPECTRA2021)

Es importante aclarar que, una vez que el usuario clone la versión del GitHub para instalarla en su computadora personal, debe crear la ruta: 
>“/resources/static/assets/uploads/”.

Esta le servirá al sistema para guardar los audios y diferentes archivos que genere.

**2.** Abra la terminal y desde allí escriba la siguiente instrucción:

>$node index.js

En caso afirmativo, debe dar el siguiente mensaje de respuesta en la consola de la terminal:

>Base de datos creada OK
>Running at localhost:3000

**3.** Una vez que se instaló el servidor y este corre en la computadora. Abra el programa REAPER y cargue el *script*  **csp_render.py** que le permitirá comunicarse entre el Reaper con el servidor.

El *script* lo puede encontrar en la carpeta llamada **2. Script_reaper**. Para cargar este *script*, se va al menú de **Reaper** con la ruta: *Actions>Load ReaScript* y se selecciona el *csp_render.py*. Como se ve en la figura 1

**Figura 1**
![](https://ottocastro.com/images/README/01.jpg)






Crédito
Herramienta creada bajo la supervisión e instrucción del *Dr. Hugo Solís*, como co-tutor del Doctorando Otto Castro Solano, para la investigación: **"Estrategias de composición a través de la similitud tímbrica mediante la sinergia entre compositor y máquina"**. Esta investigación tuvo como tutor principal al
Dr. Jorge Rodrigo Sigal Sefchovich y como miembros del comité tutor a: Dra. Rossana Lara y al Dr. Hugo Solís.



 - [ ] Más información en:
 [https://ottocastro.com/doctorado/](https://ottocastro.com/doctorado/)

*@Doctorado en Música con énfasis en Tecnología Musical, UNAM. México. Mayo, 2021. Otto Castro Solano. Agradecimiento a la beca de estudios otorgada por la Universidad de Costa Rica.*
