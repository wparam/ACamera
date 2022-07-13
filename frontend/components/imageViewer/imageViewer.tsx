import React, { useState, useMemo, useRef } from 'react';
import { List, Avatar, Space, Image, Modal, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './imageViewer.module.scss';
import api from '../../services/axios'

interface IImage {
  title: string,
  src: string,
  tags: string[]
}

type Props = {
  images: any[],
  desc: boolean
  // onClick: (any) => void
};


const ShowImageMax = 20

export default function ImageViewer(props: Props) {
  const { images, desc } = props;
  const [ loading, setLoading ] = useState<boolean>(false)
  const previewRef = useRef(null)
  const [previewImage, setPreviewImage] = useState<any>(undefined)

  const showModal = (item) => {
    setPreviewImage(item);
  };

  const handleOk = () => {
    setPreviewImage(undefined)
  }

  const handleCancel = () => {
    setPreviewImage(undefined)
  }

  const handleRemove = () => {
    if(!previewImage){
      return
    }
    setLoading(true)
    api.delete(`/api/images`, {
      data: {
        image: previewImage.name
      }
    }).then(res=>{
      handleRightMove()
    }).catch(err=>{}).then(()=>{
      setLoading(false)
    })
  }

  const handleLeftMove = () => {
    if(!previewImage){
      return
    }

    const findit = imgs.findIndex(item=>item === previewImage)
    if(findit <= 0){
      return
    }
    setPreviewImage(imgs[findit-1])

  }

  const handleRightMove = () => {
    if(!previewImage){
      return
    }

    const findit = imgs.findIndex(item=>item === previewImage)
    if(findit < 0 || findit === imgs.length - 1){
      return
    }
    setPreviewImage(imgs[findit+1])
  }

  const handleKeydown = e=>{
    if(e.code === "ArrowLeft"){
      handleLeftMove()
      return
    }
    if(e.code === "ArrowRight"){
      handleRightMove()
    }
  }

  const imgs = useMemo(() => {
    if (!images || images.length === 0) {
      return []
    }
    return images.sort((a, b) => b.name.localeCompare(a.name)).slice(0, ShowImageMax)
  }, [images, desc])

  return (
    <div>
      <List
        grid={{
          column: 8
        }}
        itemLayout="vertical"
        size="small"
        dataSource={imgs}
        renderItem={(item, key) => (
          <List.Item
            className={styles.extra}
            key={key}
          >
            <div style={{ height: '120px', overflow: 'hidden' }} >
              <Image
                className={styles.image}
                preview={false}
                onClick={() => showModal(item)}
                // width={200}
                height='100%'
                alt="logo"
                src={item.src}
              />
            </div>
            <div className={styles.extra} title={item.name}>{item.name}</div>
          </List.Item>
        )}
      />
      <Modal
        title=""
        wrapClassName={styles.preview}
        closable={false}
        visible={!!previewImage}
        footer={[
          <Button key="back" onClick={handleRemove} loading={loading}>
            Remove
          </Button>,
          <Button key="submit" onClick={handleOk}>
            Ok
          </Button>
        ]}
        onOk={handleOk}
        onCancel={handleCancel}>
        <div className="flex justify-center items-center" onKeyDown={handleKeydown} >
          <Button size='large' icon={<LeftOutlined />} onClick={handleLeftMove} ref={previewRef}/>
          <Image
            // className={styles.image}
            preview={false}
            height='100%'
            alt="logo"
            src={previewImage && previewImage.src}
          />
          <Button size='large' icon={<RightOutlined />} onClick={handleRightMove} />
        </div>
      </Modal>

    </div>
  );
}