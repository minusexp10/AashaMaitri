import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          dashboard: "Dashboard",
          welcome: "Welcome back",
          patientsInfo: "Patients Information",
          uploadReports: "Upload Reports",
          highRisk: "High Risk Cases",
          logout: "Logout",
          totalPatients: "Total Patients",
          highRiskLabel: "High Risk",
          mediumRisk: "Medium Risk",
          followUps: "Follow Ups",
          recentPatients: "Recent Patients"
        }
      },
      hi: {
        translation: {
          dashboard: "डैशबोर्ड",
          welcome: "स्वागत है",
          patientsInfo: "रोगी जानकारी",
          uploadReports: "रिपोर्ट अपलोड करें",
          highRisk: "उच्च जोखिम मामले",
          logout: "लॉग आउट",
          totalPatients: "कुल रोगी",
          highRiskLabel: "उच्च जोखिम",
          mediumRisk: "मध्यम जोखिम",
          followUps: "फॉलो-अप",
          recentPatients: "हाल के रोगी"
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  })

export default i18n