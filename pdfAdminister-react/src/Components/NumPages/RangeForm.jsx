import styles from './RangeForm.module.css'
import React, { useState,useEffect } from 'react'

const RangeForm = ({ typeRange, setTypeRange, valueRangeStart, setValueRangeStart, valueRangeEnd, setValueRangeEnd,endPage }) => {


    return (
<div className={styles.dividir_range}>
      <span>Modo de rango: </span>
      <div className={styles.dividir_options_list}>
        <button className={typeRange === 0 ? styles.selected : ''} onClick={() => setTypeRange(0)}>
          Rangos personalizado
        </button>
        <button className={typeRange === 1 ? styles.selected : ''} onClick={() => setTypeRange(1)}>
          Rangos fijos
        </button>
      </div>

      {typeRange === 0 ? (
        <div className={styles.range_list_selected}>
          <label htmlFor="">Rango 1</label>
          <div className={styles.list_grid}>
            <div>
              <label htmlFor="">De</label>
              <input
                type="number"
                name="page_init[]"
                className={styles.customInput}
                value={valueRangeStart}
                onChange={(e) => setValueRangeStart(e.target.value)}
                placeholder="1"
                min={1} 
                max={endPage}
              />
            </div>
            <div>
              <label htmlFor="">A</label>
              <input
                  type="number"
                  name="page_init[]"
                  className={styles.customInput}
                  value={valueRangeEnd}
                  onChange={(e) => {
                    const inputValue = Number(e.target.value);
                      setValueRangeEnd(inputValue);
                  }}
                  placeholder="Número de página"
                  min={1}         
                  max={endPage}   
                />
            </div>
          </div>
        </div>
      ) :  ''
      }
    </div>
    );
  };
  
  export default RangeForm;