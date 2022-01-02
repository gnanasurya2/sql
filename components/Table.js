import { useEffect, useState } from "react";
import styles from "../css/App.module.css";
export default function Table({ data }) {
  const [headers, setHeaders] = useState([]);
  const [values, setValues] = useState([]);
  useEffect(() => {
    if (data) {
      const temp = Object.values(data);
      if (temp) {
        setHeaders(Object.keys(temp[0]));
        setValues(temp.map((ele) => Object.values(ele)));
      }
    }
  }, [data]);
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((ele) => (
              <th key={ele}>{ele}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((ele) => (
            <tr>
              {ele.map((val) => (
                <td>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
