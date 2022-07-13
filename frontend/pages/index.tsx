import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import api from '../services/axios'
import ImageViewer from '../components/imageViewer/imageViewer'
import { Image, Button } from 'antd'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/router'
import Loading from '../components/loading/loading'
import Footer from '../components/footer/footer'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [imageList, setImageList] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/images').then(({ data }) => {
      setImageList(data)
    }).catch(err => {
      console.error(err)
    })
  }, [])

  const images = imageList?.map(image =>
    Object.assign({}, {
      src: `/api/images?img=${image}`,
      name: image
    })
  );

  const handleClick = () => {
    api.get('/api/download', {
      headers: {
        "Accept": 'application/zip'
      },
      responseType: 'blob'
    }).then(response=> {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'images.zip'); //or any other extension
      document.body.appendChild(link);
      link.click();
    }).catch(err => {
      console.error(err)
    })
  }

  if (typeof window === 'undefined' || !router) {
    return null
  }

  if (status === 'loading') {
    return <Loading />
  }
  if (!session) {
    router.push('/api/auth/signin')
    return null;
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>ACamera</title>
        <meta name="description" content="For Yiran" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Button onClick={handleClick}>Download</Button>
      </div>
      <main className={styles.main}>

        <div>
          <ImageViewer images={images} desc />
          {/* <Image src='/images/IMG_4536.jpg' width={200}/> */}
        </div>

      </main>

      <Footer />
    </div>
  )
}

export default Home
