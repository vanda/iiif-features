# iiif-features
Code and demos around the use of IIIF, 
from [The Victoria and Albert Museum](vam.ac.uk)


## [Layer Stack](https://github.com/vanda/layerstack)
A [viewer](https://vanda.github.io/layerstack/) based on OpenSeaDragon for stacking images in superimposition, to examine differences incrementally between similar, or related images, supplied as canvases in a IIIF manifest.
Specific regions of interest are expected to be defined as a _Range_ of _FragmentSelector_ _SpecificResource_ items, e.g [IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/#b-example-manifest-response)
(The [Compariscope](https://github.com/vanda/iiif-features#the-compariscope) editor, can assist with preparing region of interest paramaters)


## [The Compariscope](https://vanda.github.io/iiif-features/compariscope.html)
A utility app which runs stand-alone in a browser, intended for embedding within a CMS. 
Useful for the alignment of overlayed images, served by the IIIF Image API, and providing an interactive viewer for overlayed images, presented fluidly, using responsive image tags.

Try it out by pasting in some full IIIF Image URIs, such as [framemark.vam.ac.uk/collections/2018KU6176/full/full/0/default.jpg](https://framemark.vam.ac.uk/collections/2018KU6176/full/full/0/default.jpg)


## [Stop-motion viewer](https://vanda.github.io/iiif-features/frameAnimator.html)
A prototype viewer for interacting with stop-motion image sets, such as Edweard Muybridge produced in his work Animal Locomotion.

**Drag** the image!


## [Curtain Viewer](https://github.com/vanda/curtain-viewer)
A [viewer](https://vanda.github.io/curtain-viewer/) based on OpenSeaDragon, using the [curtain-sync plugin](https://github.com/cuberis/openseadragon-curtain-sync) for comparing naturally aligned image variants, such as those obtained by multi-spectral imaging, supplied as canvases in a IIIF manifest.


## [Parallax viewer](https://vanda.github.io/iiif-features/parallaxViewer.html)
A prototype viewer for interacting with image sets aproximating 3D scenes, using layers in parallax, such as the many [Peep shows](https://collections.vam.ac.uk/item/O1141038/an-artists-studio-print-engelbrecht-martin) in the V&A's collection.

**Scroll in/out and move** over the viewer!


## [Image tester](https://vanda.github.io/iiif-features/openSeadragon.html)
A basic instance of OpenSeadragon to test a IIIF image info.json, passed via the querystring

