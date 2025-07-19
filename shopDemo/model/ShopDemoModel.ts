import { _decorator, Component, Node } from 'cc';
import { BaseModel } from '../../../libs/mvc/BaseModel';
import { ShopVo } from './vo/ShopVo';
import { ShopItemSocketVo } from '../../net/protocols/ProtocolType';
import { Modules } from '../../../libs/mvc/Modules';
import { M_SHOP_INFO } from '../../net/protocols/ItemProtocol';
import { GlobalEvents } from '../../../libs/global/GlobalEvents';
import { ShopItemVo1 } from './vo/ShopItemVo1';
import { Int16 } from '../../../libs/net/baseData/Int16';
const { ccclass, property } = _decorator;
/*
* @Brief: 商店model
* @Author: hw
* @Date: 2025/06/27 11:55:31
*
* Copyright (c) 2023, All Rights Reserved.
*/
export class ShopDemoModel extends BaseModel {
    constructor() {
        super();
    }

    public static get instance(): ShopDemoModel {
        return Modules.instance.model(ShopDemoModel);
    }
    private _shopVo: ShopVo;
    private _shopVoMap: Map<number, ShopVo> = new Map();
    private _itemVoMap: Map<number, ShopItemVo1[]> = new Map();
    private _redPointList: number[] = []

    public parseShopVo(msg: M_SHOP_INFO): void {
        /** 商城数据对象 */
        let ShopData = new ShopVo()
        ShopData.parseVo(msg)
        this._shopVoMap.set(msg.id.value, ShopData)
        let itemVoList: ShopItemVo1[] = []
        for (let i = 0; i < ShopData.getShop_item_list().length; i++) {
            let itemVo = new ShopItemVo1()
            itemVo.parseVo(msg.shop_item_list[i])
            itemVoList.push(itemVo)
        }
        this._itemVoMap.set(msg.id.value, itemVoList)
        this.parseRedList(msg.id.value, itemVoList)
        this.dispatchEvent(GlobalEvents.SHOP_INFO, ShopData)
    }

    private parseRedList(shopId: number, itemVoList: ShopItemVo1[]) {
        // this._redPointList = redList
        for (let i of itemVoList) {
            if (i.getRedPoint() == 1) {
                if (this._redPointList.indexOf(shopId) < 0) {
                    this._redPointList.push(shopId)
                    return
                }

            }
        }
    }

    public getShopVo(id: number): ShopVo {
        return this._shopVoMap.get(id)
    }

    public getShopItemSocketList(id: number): ShopItemSocketVo[] {
        return this._shopVoMap.get(id).getShop_item_list();
    }

    // public initShopRedInfo(list: Int16[]) {
    //     this._redPointList = []
    //     for (let i of list) {
    //         this._redPointList.push(i.value)
    //     }
    // }


    public get shopVo(): ShopVo {
        return this._shopVo;
    }

    public getItemVoList(shopId: number): ShopItemVo1[] {
        return this._itemVoMap.get(shopId);
    }

    public getRedList(): number[] {
        return this._redPointList;
    }

}


