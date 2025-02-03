import React from 'react'
import styles from './Home.module.css'
import { Link } from "react-router-dom";
import unirPdf_img from '/src/assets/unirPdf.jpg';
import dividirPdf_img from '/src/assets/dividirPdf.jpg'

const Home = () => {
  return (
    <div className={styles.home}>
      <div className="content_wrap">
          <div className="content_wrap_element content_wrap_hover">
            <Link to="/unir-pdf" className='link'>
              <img src={unirPdf_img} alt="Unir PDF" />
              <span className="subtext">Unir pdf</span>
              <span>Une los pdf que quieras.</span>
            </Link>
          </div>

          <div className="content_wrap_element content_wrap_hover">
            <Link to="/dividir-pdf" className='link'>
              <img src={dividirPdf_img} alt="" />
              <span className='subtext'>Dividir pdf</span>
              <span>Extrae paginas de tu pdf.</span>
            </Link> 
          </div>
      </div>


    </div>
  )
}

export default Home