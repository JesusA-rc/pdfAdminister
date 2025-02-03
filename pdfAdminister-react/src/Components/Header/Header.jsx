import React from 'react'
import styles from './Header.module.css'
import pdf from '/src/assets/pdf.jpg'
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className={styles.header}>
        <div className={styles.left}>
            <Link to="/">
                <img src={pdf} alt="Logo" />
            </Link>
            <ul>
                <li>
                    <Link to="/unir-pdf">Unir PDF</Link> 
                </li>
                <li>
                    <Link to="/dividir-pdf">Dividir PDF</Link> 
                </li>
            </ul>
        </div>
        <div className={styles.right}>
            
        </div>
    </div>
  )
}

export default Header