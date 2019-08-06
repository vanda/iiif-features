import argparse
import os

def items2Manifest(source_file: str, dest_file: str, version: int):
    with open(source_file, 'r') as reader, open(dest_file, 'w') as writer:
        i = 0

        for imgDataStr in reader:
            i += 1
            imgData = imgDataStr.replace('\n', '').split(' ')
            imgURI = imgData[0]
            imgW = imgData[1]
            imgH = imgData[2]

            if version == 2:
                # P2 manifest
                manifest_item = """
                {
                  "@id": "https://vanda.github.io/iiif-features/img/manifest.json/canvas/%(i)s",
                  "@type": "sc:Canvas",
                  "label": "Hi-res, colour photograph",
                  "width": %(imgW)s,
                  "height": %(imgH)s,
                  "images": [
                    {
                      "@context": "http://iiif.io/api/presentation/2/context.json",
                      "@id": "https://vanda.github.io/iiif-features/img/manifest.json/annotation/%(i)s",
                      "@type": "oa:Annotation",
                      "motivation": "sc:painting",
                      "resource": {
                        "@id": "%(imgURI)s/full/full/0/default",
                        "@type": "dctypes:Image",
                        "format": "image/png",
                        "service": {
                          "@context": "http://iiif.io/api/image/2/context.json",
                          "@id": "%(imgURI)s",
                          "profile": [
                            "http://iiif.io/api/image/2/level1.json",
                            {
                              "formats": [
                                "png",
                                "jpg"
                              ],
                              "qualities": [
                                "native",
                                "color",
                                "gray"
                              ],
                              "supports": [
                                "regionByPct",
                                "sizeByForcedWh",
                                "sizeByWh",
                                "sizeAboveFull",
                                "rotationBy90s",
                                "mirroring",
                                "gray"
                              ]
                            }
                          ]
                        },
                        "width": %(imgW)s,
                        "height": %(imgH)s
                      },
                      "on": "https://vanda.github.io/iiif-features/img/manifest.json/canvas/%(i)s"
                    }
                  ],
                  "related": ""
                },""" % locals()
            else:
                # P3 manifest
                manifest_item = """
                {
                  "id": "https://vanda.github.io/iiif-features/img/manifest.json/canvas/%(i)s",
                  "type": "Canvas",
                  "label": {
                    "en": [
                      "360 frame %(i)s"
                    ]
                  },
                  "summary": {
                    "en": [
                      ""
                    ]
                  },
                  "width": %(imgW)s,
                  "height": %(imgH)s,
                  "requiredStatement": {
                    "label": {
                      "en": [
                        ""
                      ]
                    },
                    "value": {
                      "en": [
                        ""
                      ]
                    }
                  },
                  "items": [
                    {
                      "id": "https://vanda.github.io/iiif-features/img/manifest.json/list/%(i)s",
                      "type": "AnnotationPage",
                      "items": [
                        {
                          "id": "https://vanda.github.io/iiif-features/img/manifest.json/annotation/%(i)s",
                          "type": "Annotation",
                          "motivation": "painting",
                          "body": {
                            "@id": "%(imgURI)s/full/full/0/default",
                            "type": "Image",
                            "format": "img/jpeg",
                            "width": %(imgW)s,
                            "height": %(imgH)s,
                            "service": {
                              "id": "%(imgURI)s",
                              "type": "ImageService2",
                              "profile": "level1"
                            }
                          },
                          "target": "https://vanda.github.io/iiif-features/img/manifest.json/canvas/%(i)s"
                        }
                      ]
                    }
                  ]
                },""" % locals()

            writer.write(manifest_item)


if __name__ == "__main__":
    # Create our Argument parser and set its description
    parser = argparse.ArgumentParser(
        description="Script that generates IIIF manifest items from a file listing IIIF Image URIs",
    )

    # Add the arguments:
    #   - source_file: the source file we want to convert
    #   - dest_file: the destination where the output should go
    #   - version: the version of the IIIF Presentation API to use

    # Note: the use of the argument type of argparse.FileType could
    # streamline some things
    parser.add_argument(
        'source_file',
        help='The location of the source '
    )

    parser.add_argument(
        '--dest_file',
        help='Location of dest file (default: source_file appended with `.json`',
        default=None
    )

    parser.add_argument(
        '--version',
        help='IIIF Presentation API verion (default: 2)',
        default=2
    )

    # Parse the args (argparse automatically grabs the values from
    # sys.argv)
    args = parser.parse_args()

    s_file = args.source_file
    d_file = args.dest_file
    p_version = args.version

    # If the destination file wasn't passed, then assume we want to
    # create a new file based on the old one
    if d_file is None:
        file_path, file_extension = os.path.splitext(s_file)
        d_file = '%(file_path)s%(file_extension)s.json' % locals()

    items2Manifest(s_file, d_file, p_version)
