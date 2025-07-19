import { _decorator, Button, instantiate, Label, Node, Sprite, UITransform } from 'cc';
import { ui_class, ui_property } from '../../../libs/ui/UIManager';
import { Layers } from '../../../libs/managers/LayerManager';
import { BaseViewItem } from '../../../libs/ui/BaseViewItem';
import { ShopVo } from '../model/vo/ShopVo';
import { ShopItemSocketVo } from '../../net/protocols/ProtocolType';
import { GlobalEvents } from '../../../libs/global/GlobalEvents';
import { ShopDefine } from '../../shop/model/ShopDefine';
import { SuperLayout } from '../../../third_party/widgets/super-layout';
import { UIUtil } from '../../../libs/utils/UIUtil';
import { PathUtil } from '../../../libs/utils/PathUtil';
import { LanguageUtil } from '../../../libs/utils/LanguageUtil';
import { PropItem } from '../../props/view/PropItem';
import { PropsController } from '../../props/model/PropsController';
import { ConfigManager } from '../../../libs/managers/ConfigManager';
import { StringUtil } from '../../../libs/utils/StringUtil';
import { TipsBuyCountView } from '../../qishan/view/TipsBuyCountView';
import { VipModel } from '../../vip/model/VipModel';
import { ShopDemoController } from '../ShopDemoController';
import { ShopDemoDefine } from '../model/ShopDemoDefine';
import { TipsController } from '../../tips/TipsController';
import { KingData } from '../../global/model/KingData';
import { GameDispatcher } from '../../../libs/event/GameDispacher';
import { PropsDefine } from '../../props/model/PropsDefine';
import { LabelPlus } from 'db://label-plus/components/label-plus';
import { ShopDemoModel } from '../model/ShopDemoModel';
import { GameDefine } from '../../global/model/GameDefine';

const { ccclass, property } = _decorator;
/*
* @Brief: 战场商城界面
* @Author: hw
* @Date: 2025/06/30 14:35:08
*
* Copyright (c) 2023, All Rights Reserved.
*/
@ui_class("ShopDemoView2", "ui/shopDemo/prefabs/ShopDemoView2", Layers.PopUp)
export class ShopDemoView2 extends BaseViewItem {


    @ui_property("centerArea/bg", Node)
    private bg: Node;
    @ui_property("downArea/line", Node)
    private line: Node;
    @ui_property("centerArea/pageList/view/content", SuperLayout)
    private pageListContent: SuperLayout;
    @ui_property("downArea/pageList/view/content", SuperLayout)
    private tabList: SuperLayout;
    @ui_property("centerArea/superScroll/view/content", SuperLayout)
    private itemList: SuperLayout;
    @ui_property("centerArea/superScroll", Node)
    private centerScroll: Node;
    @ui_property("centerArea/item", Node)
    item: Node;

    private redList: number[] = [];
    private isChangeUI: boolean = false;//是否改变UI尺寸
    private moneyType: number = 0;//货币类型
    private isCheckRed: boolean = false;
    private tabRed: { [key: number]: boolean } = {};
    private curIndex: number = 1;//大标签
    private shopId: number = 1;
    private shopVo: ShopVo
    private shopItemSocketList: ShopItemSocketVo[]
    private shopIdList: number[] = []
    private pageList: {
        tabIndex: number,
        pageName: any,
        tabName: number,
        isShow: () => boolean,
        shopId: number,
        moneyType?: number
        shopTid?: any
    }[]

    constructor(parent: Node) {
        super(parent);
    }
    protected active(args: any): void {
        super.active(args)
        ShopDemoController.instance.checkRedPoint()
        this.pageListContent.node.setScale(1, 1)//禁用缩放继承
        ShopDemoController.instance.reqShopInfo(this.shopId)
        this.refreshTabList()
    }

    /**刷新列表 */
    private refreshTabList() {
        let List = ShopDefine.SHOP_ARENA_LIST;
        this.pageList = []

        for (let v of List) {//获取所有显示的tab
            if (v.isShow()) {
                this.pageList.push(v)
            }
        }
        this.updateDiamond()
    }
    /**刷新商城内容 */
    private refreshShopList() {
        if (ShopDemoModel.instance.getItemVoList(this.shopId).length > 0) {
            this.itemList.total(ShopDemoModel.instance.getItemVoList(this.shopId).length)
        }
    }
    protected addAllGlabalEvent(): void {
        super.addAllGlabalEvent()
        this.addGlobalEventHandler(GlobalEvents.SHOP_INFO, this.refreshItemList, this)
    }

    protected addAllUIEvent(): void {
        super.addAllUIEvent()
        this.addUIEvent(this.tabList.node, SuperLayout.EVENT_ITEMADD, this.onTabAdd, this)
        this.addUIEvent(this.itemList.node, SuperLayout.EVENT_ITEMADD, this.onItemAdd, this)
    }

    /**商品添加 */
    private onItemAdd(item: Node, index: number) {
        if (index == 0) {
            this.isCheckRed = false
        }
        item.active = true
        let vo = PropsController.createBaseItemVo({ tid: ShopDemoModel.instance.getItemVoList(this.shopId)[index].getTid(), num: ShopDemoModel.instance.getItemVoList(this.shopId)[index].getNum() })
        let icon = item.getChildByName('icon')
        PropItem.createItem(icon, vo, true, true)
        let lab_Title = item.getChildByName('lab_Title')
        let lab_Limit = item.getChildByName('lab_Limit')
        lab_Limit.active = true
        let RichText = item.getChildByName('RichText')
        let mask = item.getChildByName('mask')
        let maskText = mask.getChildByName('maskText')
        let img_discount = item.getChildByName('img_discount')
        img_discount.active = true
        let lab_txt = img_discount.getChildByName('lab_txt')

        let title = ConfigManager.instance.getItemConfig(ShopDemoModel.instance.getItemVoList(this.shopId)[index].getTid()).name;
        UIUtil.setString(lab_Title, title)
        lab_Title.getComponent(LabelPlus).color = PropsDefine.DARK_ITEM_COLOR_TEXT[vo.getColor()]
        let itemList = ShopDemoModel.instance.getItemVoList(this.shopId)
        let str = LanguageUtil.getLanguage(3831, itemList[index].getBuyCount(), itemList[index].getLimit())
        UIUtil.setString(lab_Limit, str)
        if (itemList[index].getLimit() == -1) {
            lab_Limit.active = false
        }
        let YuanBaoIcon = this.getYuanBaoIcon()
        UIUtil.setRichTextString(RichText, YuanBaoIcon + ShopDemoModel.instance.getItemVoList(this.shopId)[index].getPrice())
        let vip_Level = VipModel.instance.vipLevel;
        item.off(Button.EventType.CLICK)
        /**等级小于要求 */
        if (vip_Level < ShopDemoModel.instance.getItemVoList(this.shopId)[index].getLimit()) {
            mask.active = true
            mask.getChildByName("buy").active = false
            mask.getChildByName("Sprite").active = true
            mask.getChildByName("maskText").active = true
            let str = LanguageUtil.getLanguage(650, ShopDemoModel.instance.getItemVoList(this.shopId)[index].getLimit())
            UIUtil.setString(maskText, str)
            this.addUIEvent(item, Button.EventType.CLICK, () => {
                TipsController.instance.showTips(LanguageUtil.getLanguage(162, ShopDemoModel.instance.getItemVoList(this.shopId)[index].getLimit()))

            }, this, false)
        }
        else if (ShopDemoModel.instance.getItemVoList(this.shopId)[index].getLimit() - ShopDemoModel.instance.getItemVoList(this.shopId)[index].getBuyCount() == 0) {
            mask.active = true
            mask.getChildByName("buy").active = true
            mask.getChildByName("Sprite").active = false
            mask.getChildByName("maskText").active = false
        }
        else {
            mask.active = false
            this.addUIEvent(item, Button.EventType.CLICK, () => {
                this.onItemClick(item, this.shopItemSocketList[index], index)
            }, this)
        }
        /**设置红点 */
        UIUtil.setRedDotVisible(item, ShopDemoModel.instance.getItemVoList(this.shopId)[index].getRedPoint() == ShopDemoDefine.RedState.true)
        if (!this.isCheckRed) {
            if (ShopDemoModel.instance.getItemVoList(this.shopId)[index].getRedPoint() == ShopDemoDefine.RedState.true) {
                this.tabRed[this.curIndex] = true;
                this, this.isCheckRed = true;
            } else {
                this.tabRed[this.curIndex] = false
            }
        }
        UIUtil.setString(lab_txt, ShopDemoModel.instance.getItemVoList(this.shopId)[index].getDiscount() + "折")
        if (ShopDemoModel.instance.getItemVoList(this.shopId)[index].getDiscount() == 0) {
            img_discount.active = false
        }
        mask.getComponent(UITransform).contentSize = item.getComponent(UITransform).contentSize
        let img = mask.getChildByName("img_mask")
        img.getComponent(UITransform).contentSize = item.getComponent(UITransform).contentSize
    }

    /**商品点击事件 */
    private onItemClick(item: Node, vo: ShopItemSocketVo, index: number) {
        let str = LanguageUtil.getLanguage(2033)
        let max_buy_count = ShopDemoModel.instance.getItemVoList(this.shopId)[index].getLimit()
        let buy_count = ShopDemoModel.instance.getItemVoList(this.shopId)[index].getBuyCount()
        let price = vo.price
        let tid = 0
        let moneyType
        moneyType = this.pageList[this.curIndex - 1].moneyType
        if (moneyType) {
            tid = GameDefine.MoneyTypeIcon[moneyType]
        } else {
            tid = this.pageList[this.curIndex - 1].shopTid
            if (tid == null) tid = 3

        }/**调用通用购买界面 */
        TipsController.instance.openBuyCountsTipsMessageView(str, max_buy_count, max_buy_count - buy_count, price, (selectNum: number, totalPrice: number) => {
            if (totalPrice > KingData.instance.getDiamond()) {
                TipsController.instance.showTips(LanguageUtil.getLanguage(5517))
            } else {
                ShopDemoController.instance.reqBuy(this.shopId, vo.id, selectNum)
                ShopDemoController.instance.reqShopInfo(this.shopId)
            }
        }, tid)

    }

    /**获取货币图标 */
    public getYuanBaoIcon() {
        let moneyType
        let tid = null
        moneyType = this.pageList[this.curIndex - 1].moneyType
        if (moneyType) {
            tid = GameDefine.MoneyTypeIcon[moneyType]
        } else {
            tid = this.pageList[this.curIndex - 1].shopTid
            if (tid == null) tid = 3
        }
        let costCfg = ConfigManager.instance.getItemConfig(tid);
        let iconpath = PathUtil.getItemIconPath(costCfg.icon);
        let iconstr = "<img src='{0}' align=center width = 39 height = 39 style='color: #ffffff;' />"; //元宝图标  
        let icon = StringUtil.substitute(iconstr, iconpath);
        return icon;
    }
    /**大标签添加 */
    private onTabAdd(item: Node, index: number) {
        item.active = true
        item['index'] = this.pageList[index].tabIndex
        let isIn = this.redList.indexOf(this.pageList[index].shopId)
        if (isIn >= 0) {
            UIUtil.setRedDotVisible(item, true)
        } else {
            UIUtil.setRedDotVisible(item, false)
        }
        UIUtil.setString(item.getChildByName("Label"), LanguageUtil.getLanguage(this.pageList[index].tabName), false, false, this.curIndex == item['index'] ? "#FFF1D1" : "#9D8A74")
        if (index == 0) {
            UIUtil.setSpriteFrame(item, PathUtil.getCommonIcon("common_btn18"))
        }
        if (item['isListen'] != true) {
            this.addUIEvent(item, Button.EventType.CLICK, () => {
                if (this.curIndex == item['index']) {
                    return
                }
                item['isListen'] = true
                this.curIndex = item['index']
                this.shopId = this.pageList[this.curIndex - 1].shopId
                this.changeUISize()
                this.setTabState1()
                this.updateDiamond()
                ShopDemoController.instance.reqShopInfo(this.shopId)
            }, this)
        }
    }
    /**更改UI大小 */
    private changeUISize() {
        if (this.shopId == ShopDefine.SHOP_TYPE.CustomScoreShop && this.isChangeUI == false) {
            this.isChangeUI = true
            this.bg.getComponent(UITransform).height -= 100
            let height = this.bg.getComponent(UITransform).height - 30
            this.centerScroll.getComponent(UITransform).height = height
            let mask = this.centerScroll.getChildByName("view")
            mask.getComponent(UITransform).height = height
            this.line.active = true
        } else {
            if (this.isChangeUI == true) {
                this.isChangeUI = false
                this.bg.getComponent(UITransform).height += 100
                let height = this.bg.getComponent(UITransform).height - 30
                this.centerScroll.getComponent(UITransform).height = height
                let mask = this.centerScroll.getChildByName("view")
                mask.getComponent(UITransform).height = height
                this.line.active = false
                this.pageListContent.node.removeAllChildren()
            }
        }
    }
    /**设置tab状态 */
    private setTabState1() {
        for (let i of this.tabList.node.children) {
            let url = this.curIndex == i['index'] ? PathUtil.getCommonIcon("common_btn18") : PathUtil.getCommonIcon("common_btn17")
            UIUtil.setSpriteFrame(i, url)
            let label = i.getChildByName("Label").getComponent(Label)
            let color = this.curIndex == i['index'] ? "#FFF1D1" : "#9d8a74ff"
            UIUtil.setString(i, label.string, true, false, color)
        }
    }
    /**收到协议更新内容 */
    private refreshItemList(msg: ShopVo) {
        this.redList = ShopDemoModel.instance.getRedList()
        this.tabList.total(this.pageList.length)
        this.setTabState1()
        this.shopVo = msg;
        this.shopItemSocketList = this.shopVo.getShop_item_list()
        this.refreshShopList()
    }


    public deActive(): void {
        super.deActive()
    }
    /**更新货币显示 */
    private updateDiamond() {
        let tid = 0
        let data: number[] = []
        let moneyType
        if (this.pageList[this.curIndex - 1].shopId != ShopDefine.SHOP_TYPE.CustomScoreShop) {
            moneyType = this.pageList[this.curIndex - 1].moneyType
        }
        if (moneyType) {
            tid = GameDefine.MoneyTypeIcon[moneyType]
        } else {
            tid = this.pageList[this.curIndex - 1].shopTid
            if (tid == null) tid = 3
        }

        if (tid != 3) {
            data.push(3)
            data.push(tid)
            GameDispatcher.instance.dispatchEvent(GlobalEvents.Shop_UpdateMoneyInfo, data)
        } else {
            GameDispatcher.instance.dispatchEvent(GlobalEvents.Shop_UpdateMoneyInfo)
        }

    }



}


