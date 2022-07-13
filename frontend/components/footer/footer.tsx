import Image from 'next/image'
import styles from './footer.module.scss'

export default function Loading() {
  return (
    <footer className={styles.footer}>
      Powered by
      <span className={styles.logo}>
        <Image src="/favicon.ico" alt="Love YR" width={16} height={16} />
      </span>
    </footer>
  )
}