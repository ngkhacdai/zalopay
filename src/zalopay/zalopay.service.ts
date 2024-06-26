import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import * as qs from 'qs';

@Injectable()
export class ZalopayService {
    private config = {
        app_id: "2553",
        key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
        key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
        endpoint: "https://sb-openapi.zalopay.vn/v2/create",
        endpointTransfer: "https://sb-openapi.zalopay.vn/v2/transfer",
        endpointquery: "https://sb-openapi.zalopay.vn/v2/query"
    };
    async transfer(receiverId: string, amount: number, description: string) {
        const transID = Math.floor(Math.random() * 1000000);

        interface TransferRequest {
            app_id: string;
            app_trans_id: string;
            app_user: string;
            amount: number;
            receiver_id: string;
            description: string;
            mac?: string;
        }

        const transferRequest: TransferRequest = {
            app_id: this.config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
            app_user: "240626000000741",
            amount: 50000,
            receiver_id: '240626000000741',
            description: 'description',
        };

        const data = `${this.config.app_id}|${transferRequest.app_trans_id}|${transferRequest.app_user}|${transferRequest.amount}|${transferRequest.receiver_id}`;
        transferRequest.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

        const result = await axios.post(this.config.endpointTransfer, null, { params: transferRequest });
        return result.data;
    }
    async payment() {
        const embed_data = {
            redirecturl: 'https://zalopay.onrender.com/'
        };
        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);

        interface Order {
            app_id: string;
            app_trans_id: string;
            app_user: string;
            app_time: number;
            item: string;
            embed_data: string;
            amount: number;
            description: string;
            mac?: string;  // Make mac optional to allow defining it later
            callback_url: string;
        }

        const order: Order = {
            app_id: this.config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
            app_user: "240626000000741",
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: 50000,
            description: `Payment for the order #${transID}`,
            callback_url: "https://zalopay.onrender.com/zalopay/callback"
        };

        const data = `${this.config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

        const result = await axios.post(this.config.endpoint, null, { params: order });
        return result.data;
    }

    async callback(body: any) {
        let result: any = {};

        try {
            const dataStr = body.data;
            const reqMac = body.mac;

            const mac = CryptoJS.HmacSHA256(dataStr, this.config.key2).toString();
            console.log("mac =", mac);

            // kiểm tra callback hợp lệ (đến từ ZaloPay server)
            if (reqMac !== mac) {
                // callback không hợp lệ
                result.return_code = -1;
                result.return_message = "mac not equal";
            } else {
                // thanh toán thành công
                // merchant cập nhật trạng thái cho đơn hàng
                const dataJson = JSON.parse(dataStr);
                console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

                result.return_code = 1;
                result.return_message = "success";
            }
        } catch (ex) {
            result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
            result.return_message = ex.message;
        }

        return result;
    }

    async checkStatus(id: string) {
        interface PostData {
            app_id: string;
            app_trans_id: string;
            mac?: string;
        }

        let postData: PostData = {
            app_id: this.config.app_id,
            app_trans_id: id, // Input your app_trans_id
        }

        let data = postData.app_id + "|" + postData.app_trans_id + "|" + this.config.key1; // appid|app_trans_id|key1
        postData.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();


        let postConfig = {
            method: 'post',
            url: this.config.endpointquery,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(postData)
        };

        const result = await axios(postConfig)
        return result.data
    }
}
