import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {LandingFixService} from "../../shared/services/landing-fix.service";
import {ListService} from "../../shared/services/list.service";
import {IShoppingList, ShoppingList} from "../../model/shoppinglist";
import {Subscription} from "rxjs";
import {LegendService} from "../../shared/services/legend.service";
import {LegendPoint} from "../../model/legend-point";
import {Category, ICategory} from "../../model/category";
import {IItem, Item} from "../../model/item";
import {Tag} from "../../model/tag";
import {NGXLogger} from "ngx-logger";
import {IDish} from "../../model/dish";
import {DishService} from "../../shared/services/dish.service";

@Component({
    selector: 'app-edit-list',
    templateUrl: './edit-list.component.html',
    styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit, OnDestroy {
    private unsubscribe: Subscription[] = [];

    private crossedOffExist: boolean;
    private showMakeStarter: boolean;
    listLegendMap: Map<string, LegendPoint>;
    legendList: LegendPoint[] = [];
    showCrossedOff: boolean = true;
    showActions: boolean = true;
    showAddDish: boolean = false;
    showAddItem: boolean = false;
    showAddList: boolean = false;
    showFrequent: boolean = true;
    showChangeName: boolean = false;
    shoppingListIsStarter: boolean = false;
    private originalName: string = null;
    shoppingListName: string = "";
    frequentToggleAvailable: boolean = true;
    allDishes: IDish[];
    errorMessage: any;
    private highlightSourceId: string;
    private showItemLegends: boolean;

    shoppingList: ShoppingList;
    removedItems: IItem[] = [];



    constructor(
        private fix: LandingFixService,
        private route: ActivatedRoute,
        private title: Title,
        private meta: Meta,
        private listService: ListService,
        private dishService: DishService,
        public legendService: LegendService,
        private logger: NGXLogger,
    ) {
    }

    ngOnInit() {

        this.title.setTitle(this.route.snapshot.data['title']);
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.logger.debug('getting list with id: ', id);
            this.getShoppingList(id);
        });
        this.getAllDishes();
        this.highlightSourceId = this.defaultEmptySourceId();
    }

    ngOnDestroy() {
        //this.fix.removeFixBlog();
        this.unsubscribe.forEach(s => s.unsubscribe())
    }

    toggleShowActions() {
        this.showActions = !this.showActions;
        if (this.showActions) {
            // start with all inputs hidden
            this.hideAllAddInputs();
        }
    }

    toggleAddList() {
        // hide other inputs
        if (!this.showAddList) {
            // start with all inputs hidden
            this.hideAllAddInputs();
        }
        this.showAddList = !this.showAddList;
    }

    toggleAddDish() {
        // hide other inputs
        if (!this.showAddDish) {
            // start with all inputs hidden
            this.hideAllAddInputs();
        }
        this.showAddDish = !this.showAddDish;
    }

    toggleAddItem() {
        // hide other inputs
        if (!this.showAddItem) {
            // start with all inputs hidden
            this.hideAllAddInputs();
        }
        this.showAddItem = !this.showAddItem;
    }

    toggleShowFrequent() {
        // this.showFrequent = !this.showFrequent;
        if (this.showFrequent) {
            this.highlightSource(LegendService.FREQUENT);
        } else {
            if (this.highlightSourceId == LegendService.FREQUENT) {
                this.highlightSourceId = null;
            }
            this.getShoppingList(this.shoppingList.list_id);
        }
    }

    toggleShowCrossedOff() {
        this.getShoppingList(this.shoppingList.list_id);
    }

    toggleShowChangeName() {
        this.showChangeName = !this.showChangeName;
        if (this.showChangeName) {
            // save original value
            this.originalName = this.shoppingList.name;
            this.shoppingListName = this.shoppingList.name;
        } else if (this.originalName != null) {
            this.originalName = null;
        }
    }


    getShoppingList(id: string) {
        let $sub = this.listService
            .getById(id)
            .subscribe(p => {
                this.processRetrievedShoppingList(p);
            });
        this.unsubscribe.push($sub);
    }

    removeTagFromList(item: Item) {

        let $sub = this.listService.removeItemFromShoppingList(this.shoppingList.list_id, item.item_id,
            item.tag.tag_id)
            .subscribe(() => {
                this.getShoppingList(this.shoppingList.list_id);
                this.markItemRemoved(item);
            });
        this.unsubscribe.push($sub);
    }

    toggleItemCrossedOff(item: Item) {
        let $sub = this.listService.setItemCrossedOff(this.shoppingList.list_id, item.item_id,
            !item.crossed_off)
            .subscribe(() => {
                this.getShoppingList(this.shoppingList.list_id);
            });
        this.unsubscribe.push($sub);

    }


    markItemRemoved(item: IItem) {
        this.removedItems.push(item);
    }

    showLegends(item: Item) {
        if (!this.showItemLegends) {
            return false;
        }
        return item.source_keys && item.source_keys.length > 0;
    }

    iconSourceForKey(key: string, withCircle: boolean): string {
        let circleOrColor = withCircle ? "circles" : "colors"
        // assets/images/legend/colors/blue/bowl.png
        let point = this.listLegendMap.get(key);
        if (!point) {
            return null;
        }
        return "assets/images/listshop/legend/" + circleOrColor + "/" + point.color + "/" + point.icon + ".png";
    }

    clearRemoved() {
        this.removedItems = []
    }

    highlightSource(source: string) {
        this.hideAllAddInputs();
        if (!source) {
            return;
        }
        var requiresFetchedList = this.highlightSourceId != null;
        if (source == this.highlightSourceId) {
            this.highlightSourceId = this.defaultEmptySourceId();
        } else {
            this.highlightSourceId = source;
        }

        if (requiresFetchedList) {
            this.getShoppingList(this.shoppingList.list_id);
        } else {
            this.shoppingList = this.filterForDisplay(this.shoppingList);
        }
    }

    addTagToList(tag: Tag) {
        // add tag to list as item in back end
        this.logger.debug("adding tag [" + tag.tag_id + "] to list");
        let promise = this.listService.addTagItemToShoppingList(this.shoppingList.list_id, tag);

        promise.then((data) => {
            this.getShoppingList(this.shoppingList.list_id);
        }).catch((error) => {
            console.log("Promise rejected with " + JSON.stringify(error));
        });
    }

    reAddItem(item: IItem) {
        this.removedItems = this.removedItems.filter(i => i.item_id != item.item_id);
        if (item.tag) {
            this.addTagToList(item.tag);
        }
    }

    getAllDishes() {
        this.dishService.getAllDishes()
            .subscribe(p => {
                    this.allDishes = p;
                },
                e => this.errorMessage = e);

    }

    addDishToList(dish: any) {
        this.listLegendMap = null;
        let $sub = this.listService.addDishToShoppingList(this.shoppingList.list_id, dish.dish_id)
            .subscribe(() => {
                this.highlightSourceId = "d" + dish.dish_id;
                this.getShoppingList(this.shoppingList.list_id);
                this.showAddDish = false;
            });
        this.unsubscribe.push($sub);
    }

    addListToList(fromList: IShoppingList) {
        this.listLegendMap = null;
        this.showAddList = false;
        let promise = this.listService.addListToShoppingList(this.shoppingList.list_id, fromList.list_id);
        promise.then(data => {
            this.highlightSourceId = "l" + fromList.list_id;
            this.getShoppingList(this.shoppingList.list_id);
            this.showAddList = false;
        })
    }

    removeDishOrList(sourcekey: string) {
        this.hideAllAddInputs();
        let promise = this.listService.removeItemsByDishOrList(this.shoppingList.list_id, sourcekey)
        promise.then(data => {
            this.getShoppingList(this.shoppingList.list_id);
        });

        if (this.highlightSourceId == sourcekey) {
            this.highlightSourceId = this.defaultEmptySourceId();
        }
    }

    makeStarterList() {
        this.hideAllAddInputs()
        let promise = this.listService.updateShoppingListStarterStatus(this.shoppingList);
        promise.then(data => {
            this.getShoppingList(this.shoppingList.list_id);
        });

    }

    saveListName() {
        this.showChangeName = false;
        this.originalName = null;
        this.shoppingList.name = this.shoppingListName;
        let promise = this.listService.updateShoppingListName(this.shoppingList)
        promise.then(data => {
            this.getShoppingList(this.shoppingList.list_id);
        });

    }

    clearList() {
        this.highlightSourceId = null;
        this.showFrequent = false;
        let promise = this.listService.removeAllItemsFromList(this.shoppingList.list_id);
        promise.then(data => {
            this.getShoppingList(this.shoppingList.list_id)
        });
    }

    private processRetrievedShoppingList(p: IShoppingList) {
        this.determineCrossedOffPresent(p);
        this.prepareLegend(p);
        this.adjustForStarter(p);
        this.shoppingList = this.filterForDisplay(p);
        this.showItemLegends = this.newEvaluateShowLegend();
    }


    private determineCrossedOffPresent(shoppingList: IShoppingList) {
        let crossedOff = ListService.getCrossedOff(shoppingList);
        this.crossedOffExist = crossedOff.length > 0;
    }

    private prepareLegend(list: IShoppingList) {

        let legendMap = this.legendService.processLegend(list.legend);
        var collectedValue: LegendPoint[] = [];
        this.listLegendMap = new Map();
        legendMap.forEach((value: LegendPoint, key: string) => {
            collectedValue.push(value);
            this.listLegendMap.set(key, value);
        });
        collectedValue.sort((a, b) => {
            return a.display.toLowerCase().localeCompare(b.display.toLowerCase());
        });
        this.legendList = collectedValue;

    }

    private filterForDisplay(shoppingList: IShoppingList): IShoppingList {
        if (shoppingList.categories.length == 0) {
            this.showFrequent = false;
            return shoppingList;
        }

        if (!this.showCrossedOff) {
            for (let category of shoppingList.categories) {
                this.hideCrossedOff(category);
            }
        }
        if (this.highlightSourceId) {
            shoppingList.categories = this.pullCategoryByTag(this.highlightSourceId, shoppingList);
        }
        return shoppingList;
    }

    private hideCrossedOff(category: ICategory) {
        // process subcategories
        for (let subcategory of category.subcategories) {
            this.hideCrossedOff(subcategory);
        }
        // process direct items
        category.items = category.items.filter(i => !i.crossed_off);
    }

    private pullCategoryByTag(sourceId: string, shoppingList: IShoppingList) {
        if (!sourceId) {
            return;
        }
        var highlightId = sourceId ? sourceId : LegendService.FREQUENT;

        var newCategories = [];
        var pulledItems = [];
        for (let category of shoppingList.categories) {
            var categoryItems = [];
            for (let item of category.items) {
                if (item.source_keys.includes(highlightId)) {
                    pulledItems.push(item);
                } else {
                    categoryItems.push(item);
                }
            }
            if (categoryItems.length > 0) {
                category.items = categoryItems;
                newCategories.push(category);
            }
        }

        if (pulledItems.length == 0) {
            // nothing to pull out
            // if pull is frequent, "unset" and return
            if (highlightId == LegendService.FREQUENT) {
                this.showFrequent = false;
            }
            return newCategories;
        }
        // now, make new category
        var name;
        var is_frequent = false;
        if (highlightId == LegendService.FREQUENT) {
            name = "Frequent";
            is_frequent = true;
        } else {
            var legendPoint = this.listLegendMap.get(this.highlightSourceId);
            name = legendPoint.display;

        }
        // to fill in name, items, is_frequent
        var pulledCategory = new Category(
            name,
            pulledItems,
            null,
            "yes",
            is_frequent,
            true
        )

        // put pulledItems at the front of the list
        newCategories.unshift(pulledCategory);
        return newCategories;
    }

    private defaultEmptySourceId() {
        // will be either null or frequent, depending upon frequent availabilty
        // and current frequent toggle state
        if (this.frequentToggleAvailable && this.showFrequent) {
            return LegendService.FREQUENT;
        }
        return null;

    }

    private newEvaluateShowLegend() {
        let thisListIsTheStarter = this.shoppingList.is_starter;
        if (thisListIsTheStarter) {
            return false;
        }
        return this.shoppingList.legend.length > 0;
    }


    private hideAllAddInputs() {
        this.showAddItem = false;
        this.showAddDish = false;
        this.showAddList = false;
        this.showChangeName = false;
    }


    private adjustForStarter(list: IShoppingList) {
        this.shoppingListIsStarter = list.is_starter;
        if (this.shoppingListIsStarter) {
            this.showMakeStarter = false;
            this.frequentToggleAvailable = !this.shoppingListIsStarter;
            // check if currently sorted on frequent - if so, reset to null
            if (this.highlightSourceId == LegendService.FREQUENT) {
                this.highlightSourceId = null;
            }
        } else {
            this.showMakeStarter = true;
            this.frequentToggleAvailable = true;

            // check showFrequent toggle, and set source id if on.
            if (this.showFrequent && this.highlightSourceId == null) {
                this.highlightSourceId = LegendService.FREQUENT;
            }

        }

    }


}
