import { _decorator, Component, Node } from 'cc';
import { AttrSocketVo, ShopItemSocketVo } from '../../../net/protocols/ProtocolType';
import { LanguageUtil } from 'db://assets/script/libs/utils/LanguageUtil';


/*
* @Brief: 商店道具vo
* @Author: hw
* @Date: 2025/06/27 11:30:51
*
* Copyright (c) 2023, All Rights Reserved.
*/
export class ShopItemVo1 {

    /** 商品id */
    protected id: number;
    /** 货币类型 */
    protected pay_type: number;
    /** 道具tid */
    protected pay_item: number;
    /** 价格 */
    protected price: number;
    /** 商品tid */
    protected tid: number;
    /** 道具数量 */
    protected num: number;
    /** 已购数量 */
    protected buy_count: number;
    /** 每日限购 */
    protected limit_day: number;
    /** 每周限购 */
    protected limit_week: number;
    /** 每月限购 */
    protected limit_month: number;
    /** 限购(未刷新前) */
    protected limit: number;
    /** vip等级购买限制 */
    protected limit_vip: number;
    /** 批量购买数量 */
    protected batch: number;
    /** 排序 */
    protected sort: number;
    /** 折扣 */
    protected discount: number;
    /** 是否是新品(0不是  1是) */
    protected is_new: number;
    /** 固定展示位置(0无  其他代表固有位置) */
    protected show_pos: number;
    /** 条件列表 {条件类型：1-联盟战商店等级 2-名将试炼最大通关章节 3-角色等级， 条件值} */
    protected cond_list: { [key: number]: number; } = {};
    /** 红点状态(1-有红点 0-无红点) */
    protected red_point: number;

    public parseVo(msg: ShopItemSocketVo) {
        this.id = msg.id
        this.pay_type = msg.pay_type.value
        this.pay_item = msg.pay_item
        this.price = msg.price
        this.tid = msg.tid
        this.num = msg.num
        this.buy_count = msg.buy_count
        this.limit_day = msg.limit_day
        this.limit_week = msg.limit_week
        this.limit_month = msg.limit_month
        this.limit = msg.limit
        this.limit_vip = msg.limit_vip
        this.batch = msg.batch
        this.sort = msg.sort.value
        this.discount = msg.discount.value
        this.is_new = msg.is_new.value
        this.show_pos = msg.show_pos.value
        for (let v of msg.cond_list) {
            this.cond_list[v.type.value] = v.value;
        }
        this.red_point = msg.red_point.value
    }
    public getId() {
        return this.id
    }
    public getSort() {
        return this.sort
    }
    public getDiscount() {
        return this.discount
    }
    public getIsNew() {
        return this.is_new
    }
    public getShowPos() {
        return this.show_pos
    }
    public getNum() {
        return this.num
    }
    public getPrice() {
        return this.price
    }
    public getRedPoint() {
        return this.red_point
    }
    public getTid() {
        return this.tid
    }

    public getCond_list() {
        return this.cond_list[3] ? this.cond_list[3] : 0;
    }

    public getLimit() {
        if (this.limit > 0) {
            return this.limit
        } else if (this.limit_day > 0) {
            return this.limit_day
        } else if (this.limit_week > 0) {
            return this.limit_week
        } else if (this.limit_month > 0) {
            return this.limit_month
        } else {
            return -1
        }
    }

    public getBuyCount() {
        return this.buy_count
    }



}


