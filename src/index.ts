import { isRef, ref } from 'vue-demi'
import { inBrowser } from 'js-cool'
import type { Ref } from 'vue-demi'

declare global {
	interface Window {
		wx: any
		WeixinJSBridge: any
	}
}

export interface Options {
	//
}

export interface InvokeWxPayData {
	appID: string
	timeStamp: number
	nonceStr: string
	prepayID: string
	paySign: string
}

function useWxPay(options: Options = {}) {
	if (!inBrowser) return
	// const { done } = useWxConfig()

	const chooseWxPay = async data => {
		console.info('chooseWxPay [data]: ', data)

		if (!data) {
			console.warn('微信支付凭证为空')
			return
		}
		if (!done.value) await new Promise(resolve => wx.ready(resolve))

		const { timeStamp: timestamp, nonceStr, packageStr, signType, sign, paySign, cancel } = data

		return new Promise((resolve, reject) => {
			wx.chooseWXPay({
				timestamp,
				nonceStr,
				package: packageStr,
				signType,
				paySign,
				sign,
				success: resolve,
				fail: reject,
				cancel
			})
		})
	}

	// invoke
	const invokeWxPay = async (data: InvokeWxPayData) => {
		console.info('invokeWxPay [data]: ', data)
		if (typeof window.WeixinJSBridge === 'undefined') {
			if (document.addEventListener) {
				await new Promise(resolve =>
					document.addEventListener('WeixinJSBridgeReady', resolve, {
						once: true,
						capture: false
					})
				)
			} else if ((document as any).attachEvent) {
				// 这个代码可去掉
				await new Promise(resolve =>
					(document as any).attachEvent('WeixinJSBridgeReady', resolve)
				)
				await new Promise(resolve =>
					(document as any).attachEvent('onWeixinJSBridgeReady', resolve)
				)
			}
		}

		const { appID: appId, timeStamp, nonceStr, prepayID, paySign } = data

		return new Promise((resolve, reject) => {
			window.WeixinJSBridge.invoke(
				'getBrandWCPayRequest',
				{
					appId, // 公众号名称，由商户传入
					timeStamp, // 时间戳，自1970年以来的秒数
					nonceStr, // 随机串
					package: `prepay_id=${prepayID}`,
					signType: 'MD5', // 微信签名方式：
					paySign // 微信签名
				},
				({ err_msg }: { err_msg: string }) => {
					if (err_msg === 'get_brand_wcpay_request:ok') resolve(true)
					else if (err_msg === 'get_brand_wcpay_request:fail')
						reject(new Error('Error occurred'))
				}
			)
		})
	}

	return {
		chooseWxPay,
		invokeWxPay
	}
}

export default useWxPay
