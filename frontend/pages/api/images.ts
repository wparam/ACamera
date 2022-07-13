import nextConnect from 'next-connect';
import fs from 'fs'
import path from 'path'
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next'

const imageFolder = process.env.UPLOAD || 'public/images'

const ImageTypes = ['.png', '.jpg', '.jpeg', '.ico']

const readFolderImage = (folder: string): string[] => {
  if (!folder || !fs.existsSync(folder)) {
    return []
  }
  return fs.readdirSync(folder).filter(fn => ImageTypes.includes(fn.toLowerCase().substring(fn.lastIndexOf('.'))))
}

const readImage = (img: string, cb: (data: any) => void) => {
  const imgPath = path.join(imageFolder, img)
  if (!imgPath || !fs.existsSync(imgPath)) {
    return
  }
  fs.readFile(imgPath, (err, data) => {
    if (err) {
      throw err
    }
    return cb(data)
  })
}

const removeImage = (img: string, cb) => {
  const imgPath = path.join(imageFolder, img)
  fs.rm(imgPath, (err) => {
    if (err) {
      throw err
    }
    return cb(true)
  })
}

const getContentType = (imgPath: string) => {
  const ft = imgPath.substring(imgPath.lastIndexOf('.') + 1)
  return `image/${ft}`
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const session = await getSession({ req })

  if (!session) {
    return res.status(401).end()
  }

  try {
    switch (req.method) {
      case 'POST':
        break;
      case 'DELETE':
        removeImage(req.body.image, flag => {
          if (flag) {
            return res.status(200).end()
          }
          return res.status(500).end()
        })
        break;
      default:
        const img = req.query.img as string;
        if (!img) {
          const files = readFolderImage(imageFolder)
          res.status(200).json(files)
        } else {
          const contentType = getContentType(img)
          res.writeHead(200, { 'Content-Type': contentType })
          readImage(img, data => {
            if (!data) { return res.status(500).end() }
            else {
              res.end(data)
            }
          })
        }
        break
    }

  }
  catch (err) {
    res.status(500).end(err)
  }
}

// const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
//   onError: (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).end("Something broke!");
//   },
//   onNoMatch: (req, res, next) => {
//     res.status(404).end("Page is not found");
//   }
// })
// .get((req, res) => {
//   const { img } = req.query;
//   if(!img){
//     const files = readFolderImage(imageFolder)
//     res.status(200).json(files)
//   }else{
//     const contentType = getContentType(img)
//     res.writeHead(200, {'Content-Type': contentType})
//     readImage(img, data=>{
//       if(!data){ return res.status(500) }
//       else{
//         res.end(data)
//       }
//     })
//   }
// });

// export default apiRoute;
