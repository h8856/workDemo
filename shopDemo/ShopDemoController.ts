import { _decorator, Component, Node } from 'cc';
import { BaseController } from '../../libs/mvc/BaseController';
import { C_SHOP_BUY, C_SHOP_INFO, C_SHOP_REFRESH, M_RED_POINT_SHOP_IDS, M_SHOP_BUY, M_SHOP_INFO } from '../net/protocols/ItemProtocol';
import { Int16 } from '../../libs/net/baseData/Int16';
import { ShopDemoModel } from './model/ShopDemoModel';
import { Modules } from '../../libs/mvc/Modules';
import { GlobalEvents } from '../../libs/global/GlobalEvents';
import { ShopDefine } from '../shop/model/ShopDefine';
const { ccclass, property } = _decorator;
/*
* @Brief: 商店控制类
* @Author: hw
* @Date: 2025/06/27 11:55:06
*
* Copyright (c) 2023, All Rights Reserved.
*/
export class ShopDemoController extends BaseController {

    constructor() {
        super();
    }
    public static get instance(): ShopDemoController {
        return Modules.instance.controller(ShopDemoController);
    }
    public addAllSocketEventHandler() {
        this.addSocketEventHandler(M_SHOP_INFO, this.onSCShopInfo, this);
        // this.addSocketEventHandler(M_RED_POINT_SHOP_IDS, this.onSCShopNotice, this)
        // this.addSocketEventHandler(M_SHOP_BUY, this.onSCShopBuy, this);
    }
    /**请求商品列表 */
    public reqShopInfo(id: number) {
        let cmd: C_SHOP_INFO = new C_SHOP_INFO();
        cmd.id = new Int16(id);
        this.sendSocketCmd(C_SHOP_INFO.CMD, cmd);
    }

    /**清除红点列表 */
    public clearRedPointList() {

    }
    /**返回商城信息 */
    private onSCShopInfo(msg: M_SHOP_INFO) {
        ShopDemoModel.instance.parseShopVo(msg)
    }
    /**请求刷新商品 */
    public reqRefreshShop(shop_id) {
        let cmd: C_SHOP_REFRESH = new C_SHOP_REFRESH()
        cmd.shop_id = new Int16(shop_id);
        this.sendSocketCmd(C_SHOP_REFRESH.CMD, cmd);
    }
    /**请求购买商品 */
    public reqBuy(shop_id: number, item_id: number, num: number) {
        let msg = new C_SHOP_BUY()
        /** 商店id */
        msg.shop_id = new Int16(shop_id);
        /** 商品id */
        msg.item_id = item_id;
        /** 数量 */
        msg.num = new Int16(num);
        this.sendSocketCmd(C_SHOP_BUY.CMD, msg)
    }

    /**检查红点 */
    public checkRedPoint() {
        let shopIdList = []
        let List = ShopDefine.SHOP_TAB_LIST;
        let pageList = []
        let pageList2 = []
        let pageList3 = []
        for (let v of List) {//获取所有显示的tab
            if (v.isShow()) {
                pageList.push(v)
            }
        }
        let tabList2 = ShopDefine.SHOP_SUB_TAB_LIST[ShopDefine.SHOP_TYPE.CustomScoreShop]
        for (let v of tabList2) {//获取所有显示的tab
            if (v.isShow()) {
                pageList2.push(v)
            }
        }

        let tabList3 = ShopDefine.SHOP_ARENA_LIST
        for (let v of tabList3) {//获取所有显示的tab
            if (v.isShow()) {
                pageList3.push(v)
            }
        }
        for (let i of pageList) {
            shopIdList.push(i.shopId)
        }
        for (let i of pageList2) {
            shopIdList.push(i.id)
        }
        for (let i of pageList3) {
            shopIdList.push(i.shopId)
        }
        for (let i = 0; i < shopIdList.length; i++) {
            this.reqShopInfo(shopIdList[i])
        }

    }



    // public onSCShopNotice(msg: M_RED_POINT_SHOP_IDS) {
    //     ShopDemoModel.instance.initShopRedInfo(msg.shop_list)
    // }

    // private onSCShopBuy(msg: M_SHOP_BUY) {
    //     let data = {
    //         shop_id: msg.shop_id.value,
    //         num: msg.num,
    //         res: msg.res.value,
    //         shop_item_list: msg.shop_item_list,
    //         tid: msg.tid,
    //     }
    //     ShopDemoModel.instance.shopItemSocketList = msg.shop_item_list;
    //     this.dispatchEvent(GlobalEvents.SHOP_BUY_RESULT, data);
    // }
}


