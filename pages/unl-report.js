import { useTranslation, Trans } from 'next-i18next'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'

export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'unl-report'])),
    },
  }
}

import SEO from '../components/SEO'
import CopyButton from '../components/UI/CopyButton'

import { useWidth } from '../utils'
import {
  trWithAccount,
  userOrServiceLink,
  niceNumber,
  shortHash,
  codeHighlight
} from '../utils/format'

export default function UNLreport() {
  const { t } = useTranslation(['common', 'unl-report'])
  const router = useRouter()

  const { isReady } = router

  const windowWidth = useWidth()

  const [rawData, setRawData] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showRawData, setShowRawData] = useState(false)

  const controller = new AbortController()

  const checkApi = async () => {
    let apiUrl = 'xrpl/ledgerEntry/61E32E7A24A238F1C619D5F9DDCC41A94B33B66C0163F7EFCC8A19C9FD6F28DC'

    setLoading(true)
    setRawData({})
    setData([])

    const response = await axios.get(apiUrl, {
      signal: controller.signal
    }).catch(error => {
      if (error && error.message !== "canceled") {
        setErrorMessage(t("error." + error.message))
        setLoading(false) //keep here for fast tab clickers
      }
    })
    const newdata = response?.data;

    if (newdata) {
      setRawData(newdata)
      setLoading(false) //keep here for fast tab clickers
      if (newdata.index) {
        setErrorMessage("")
        setData(newdata.node.ActiveValidators)
      } else {
        if (newdata.error) {
          setErrorMessage(newdata.error)
        } else {
          setErrorMessage("Error")
          console.log(newdata)
        }
      }
    }
  }

  /*
    {
      "index": "61E32E7A24A238F1C619D5F9DDCC41A94B33B66C0163F7EFCC8A19C9FD6F28DC",
      "ledger_hash": "082C7468B15FC93DF216FE1B58CA326F7DF42A753F0399C027F747E572DFA913",
      "ledger_index": 7322707,
      "node": {
        "ActiveValidators": [
          {
            "ActiveValidator": {
              "Account": "rGhk2uLd8ShzX2Zrcgn8sQk1LWBG4jjEwf",
              "PublicKey": "ED3ABC6740983BFB13FFD9728EBCC365A2877877D368FC28990819522300C92A69"
            }
          },
          {
            "ActiveValidator": {
              "Account": "rnr4kwS1VkJhvjVRuq2fbWZtEdN2HbpVVu",
              "PublicKey": "ED49F82B2FFD537F224A1E0A10DEEFC3C25CE3882979E6B327C9F18603D21F0A22"
            }
          }
        ],
        "Flags": 0,
        "ImportVLKeys": [
          {
            "ImportVLKey": {
              "Account": "rBxZvQBY551DJ21g9AC1Qc9ASQowqcskbF",
              "PublicKey": "ED264807102805220DA0F312E71FC2C69E1552C9C5790F6C25E3729DEB573D5860"
            }
          }
        ],
        "LedgerEntryType": "UNLReport",
        "PreviousTxnID": "F11F033948A947445058ED1E1454DE31FC646BFE648587983CBFB9608D3D50C1",
        "PreviousTxnLgrSeq": 7322624,
        "index": "61E32E7A24A238F1C619D5F9DDCC41A94B33B66C0163F7EFCC8A19C9FD6F28DC"
      },
      "validated": true
    }
  */

  useEffect(() => {
    checkApi()
    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  return <>
    <SEO title={t("header", { ns: "unl-report" })} />
    <div className="content-text">
      <h1 className="center">{t("header", { ns: "unl-report" })}</h1>
      <div className='flex'>
        <div className="grey-box center">
          {t("desc", { ns: 'unl-report' })}
          <br /><br />
          {loading ?
            t("general.loading")
            :
            <Trans i18nKey="summary" ns="unl-report">
              There are <b>{{ activeValidators: niceNumber(data?.length) }}</b> active validators.
            </Trans>
          }
        </div >
      </div >
      <br />
      {
        (windowWidth > 1000) ?
          <table className="table-large shrink">
            <thead>
              <tr>
                <th className='center'>{t("table.index")}</th>
                <th className='left'>{t("table.public-key")}</th>
                <th className='center'>{t("table.address")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ?
                <tr className='right'>
                  <td colSpan="100">
                    <br />
                    <span className="waiting"></span>
                    <br />{t("general.loading")}<br />
                    <br />
                  </td>
                </tr>
                :
                <>
                  {(!errorMessage && data) ?
                    <>
                      {data.length > 0 &&
                        data.map((av, i) =>
                          <tr key={i}>
                            <td className='center'>{i + 1}</td>
                            <td className='left'>
                              {shortHash(av.ActiveValidator.PublicKey)} <CopyButton text={av.ActiveValidator.PublicKey} />
                            </td>
                            <td>
                              <table>
                                <tbody>
                                  {trWithAccount(av.ActiveValidator, 'Account')}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )
                      }
                    </>
                    :
                    <tr><td colSpan="100" className='center orange bold'>{errorMessage}</td></tr>
                  }
                </>
              }
            </tbody>
          </table>
          :
          <table className="table-mobile">
            <thead>
            </thead>
            <tbody>
              {loading ?
                <tr className='center'>
                  <td colSpan="100">
                    <br />
                    <span className="waiting"></span>
                    <br />{t("general.loading")}<br />
                    <br />
                  </td>
                </tr>
                :
                <>
                  {!errorMessage ? data.map((av, i) =>
                    <tr key={i}>
                      <td style={{ padding: "5px" }} className='center'>
                        <b>{i + 1}</b>
                      </td>
                      <td>
                        <p>
                          {t("table.address")}: <a href={"/explorer/" + av.ActiveValidator.Account}>{av.ActiveValidator.Account}</a> {userOrServiceLink(av.ActiveValidator, 'Account')}
                        </p>
                        {/* r.service &&
                          <p>
                            {t("table.service", { ns: "unl-report" })}: {r.service}
                          </p>
                        */ }
                        <p>
                          {t("table.public-key")}: {shortHash(av.ActiveValidator.PublicKey)}
                          {" "}
                          <CopyButton text={av.ActiveValidator.PublicKey} />
                        </p>
                      </td>
                    </tr>)
                    :
                    <tr><td colSpan="100" className='center orange bold'>{errorMessage}</td></tr>
                  }
                </>
              }
            </tbody>
          </table>
      }
      <div className='center'>
        <br />
        {t("table.raw-data")}: <span className='link' onClick={() => setShowRawData(!showRawData)}>
          {showRawData ? t("table.text.hide") : t("table.text.show")}
        </span>
        <br /><br />
      </div>
      <div className={'slide ' + (showRawData ? "opened" : "closed")}>
        {codeHighlight(rawData)}
      </div>
    </div>
  </>
}