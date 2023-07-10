import geoip from 'geoip-lite'
// 中文数据是在网上查询的，可能会有些问题
import ProvinceCityData from './cn.json'
import { toLower } from 'lodash'

const isIp = (ip: string = '') => /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$/.test(ip)

const CountryMap = {
  CN: '中国'
}


export const ip2Locale = (ip: string) => {
  const defaultData = {
    country: '',
    province: '',
    city: ''
  }
  if (!isIp(ip)) {
    return defaultData
  }

  const geo = geoip.lookup(ip)
  if (!geo) {
    // 没有获取到地址信息
    return defaultData
  }

  const { country, region, city } = geo
  const data = {
    country: CountryMap[country] || country,
    province: ProvinceCityData[region] || region,
    city: ProvinceCityData[toLower(city)] || city
  }
  return data
}

