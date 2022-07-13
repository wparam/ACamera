import nextConnect from 'next-connect';
import fs from 'fs'
import path from 'path'
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next'
import JSZip from 'jszip';

const Download_Input = process.env.DOWNLOAD_INPUT || 'public/images'
const Download_Output = process.env.DOWNLOAD_OUTPUT || 'public/out_images'

const zip = new JSZip()

const ImageTypes = ['.png', '.jpg', '.jpeg', '.ico']

const attachImage = (zipo, folder)=> {
  if (!zipo || !folder || !fs.existsSync(folder)) {
    return 
  }
  fs.readdirSync(folder).filter(fn => ImageTypes.includes(fn.toLowerCase().substring(fn.lastIndexOf('.')))).forEach(file=>{
    let npath = path.join(folder, file)
    zipo.file(file, fs.readFileSync(npath))
  })
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse
) => {

  const session = await getSession({ req })

  if (!session) {
    return res.status(401).end()
  }
  
  var inputs = zip.folder('inputs');
  attachImage(inputs, Download_Input)

  var output = zip.folder('outputs');
  attachImage(output, Download_Output)

  zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
    // see FileSaver.js
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-disposition', 'attachment; filename="images.zip"');
    res.end(content)
  })
  .catch((err) => res.status(500).end())
}
