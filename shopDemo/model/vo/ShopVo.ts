import { _decorator, Component, Node } from 'cc';
import { AttrSocketVo, ShopItemSocketVo } from '../../../net/protocols/ProtocolType';
import { M_SHOP_INFO } from '../../../net/protocols/ItemProtocol';
import { ShopItemVo1 } from './ShopItemVo1';

/*
* @Brief: 商店数据对象
* @Author: hw
* @Date: 2025/06/27 11:53:38
*
* Copyright (c) 2023, All Rights Reserved.
*/
export class ShopVo {
    /** 商品id */
    protected id: number;
    /**免费次数 */
    protected free_count: number;
    /** 免费刷新次数倒时间 */
    protected left_time: number;
    /** 免费刷新次数上线 */
    protected free_refresh_limit: number;
    /** 已刷新次数 */
    protected refresh_count: number;
    /** 刷新次数上限 */
    protected refresh_count_limit: number;
    /**刷新价格 */
    protected refresh_price: number;
    /**结束时间 */
    protected end_time: number;
    /**商品列表 */
    protected shop_item_list: ShopItemSocketVo[];
    /**货币刷新 */
    protected refresh_pay: number;
    /**道具刷新 */
    protected refresh_item: number;



    public parseVo(msg: M_SHOP_INFO) {
        /** 商城id */
        this.id = msg.id.value
        /** 剩余免费刷新次数 */
        this.free_count = msg.free_count.value
        /** 免费刷新次数倒计时 */
        this.left_time = msg.left_time
        /** 免费刷新次数上限 */
        this.free_refresh_limit = msg.free_refresh_limit
        /** 当天共刷新次数 (Int16) */
        this.refresh_count = msg.refresh_count.value
        /** 当天共刷新次数上限 (Int16) */
        this.refresh_count_limit = msg.refresh_count_limit.value
        /** 刷新价格 (Int16) */
        this.refresh_price = msg.refresh_price.value
        /** 截止时间(活动专用) */
        this.end_time = msg.end_time
        /** 道具列表 */
        this.shop_item_list = msg.shop_item_list
        /** 货币刷新 (Int16) */
        this.refresh_pay = msg.refresh_pay.value
        /** 道具刷新 */
        this.refresh_item = msg.refresh_item
    }

    public getShop_item_list() {
        return this.shop_item_list
    }

}


