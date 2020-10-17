import {User} from "./user";
import {IShoppingList} from "./shoppinglist";
import {ItemSource} from "./item-source";
import {Category} from "./category";
import {Item} from "./item";
import {ITag} from "./tag";
import {Dish} from "./dish";



export default class MappingUtils {


    static showConsoleLogs: boolean = false;


    static toUser(r: any): User {
        let user = <User>({
            email: r.user.email,
            creation_date: r.user.creation_date,
            user_name: r.user.user_name,
            roles: r.user.roles,
            token: r.user.token

        });
        return user;
    }

    static toShoppingList(jsonResult: any): IShoppingList {
        let shoppinglist = <IShoppingList>({
            list_id: jsonResult.shopping_list.list_id,
            name: jsonResult.shopping_list.name,
            user_id: jsonResult.shopping_list.user_id,
            created: jsonResult.shopping_list.created,
            list_type: jsonResult.shopping_list.list_type,
            item_count: jsonResult.shopping_list.item_count,
            updated: jsonResult.shopping_list.updated,
            layout_type: jsonResult.shopping_list.list_layout_type,
            source_keys: jsonResult.shopping_list.source_keys != null ? jsonResult.shopping_list.source_keys.map(MappingUtils._toItemSource) : null,
            categories: jsonResult.shopping_list.categories != null ? jsonResult.shopping_list.categories.map(MappingUtils._toCategory) : null
        });

        if (MappingUtils.showConsoleLogs) {
            console.log('Parsed list:', shoppinglist);
        }
        return shoppinglist;

    }

    private static _toItemSource(jsonResult: any): ItemSource {
        let source = <ItemSource>({
            id: jsonResult.id,
            display: jsonResult.display,
            type: jsonResult.type,
            disp_class: null,
        });

        return source;
    }

    private static _toCategory(jsonResult: any): Category {
        let category = <Category>({
            name: jsonResult.name,
            items: jsonResult.items.map(MappingUtils._toItem),
            //category_type: jsonResult.category_type,
            subcategories: jsonResult.subcategories ? jsonResult.subcategories.map(MappingUtils._toCategory) : null

        });

        if (MappingUtils.showConsoleLogs) {
            console.log('Parsed category:', category);

        }

        return category;
    }

    private static _toItem(jsonResult: any): Item {
        let item = <Item>({
            list_id: jsonResult.list_id,
            item_id: jsonResult.item_id,
            source_keys: jsonResult.source_keys != null ? jsonResult.source_keys.map(MappingUtils._toItemSource) : null,
            added: jsonResult.added,
            tag_id: jsonResult.tag_id,
            used_count: jsonResult.used_count,
            free_text: jsonResult.free_text,
            crossed_off_ts: jsonResult.crossed_off,
            crossed_off: (jsonResult.crossed_off != null),
            tag: MappingUtils._toTag(jsonResult.tag)
        });

        if (MappingUtils.showConsoleLogs) {
            console.log('Parsed tag:', item);

        }
        return item;
    }

    private static _toTag(jsonResult: any): ITag {
        let tag = <ITag>({
            tag_id: jsonResult.tag_id,
            name: jsonResult.name,
            description: jsonResult.description,
            search_select: jsonResult.search_select,
            assign_select: jsonResult.assign_select,
            power: jsonResult.power,
            parent_id: jsonResult.parent_id,
            dishes: jsonResult.dishes ? jsonResult.dishes.map(MappingUtils._toDish) : null,
            is_inverted: false,
            tag_type: jsonResult.tag_type
        });
        return tag
    }

    private static _toDish(jsonResult: any): Dish {
        let dish = <Dish>({
                dish_id: jsonResult.dish_id,
                name: jsonResult.name,
                description: jsonResult.description,
                user_id: jsonResult.user_id,
                last_added: jsonResult.last_added,
                tags: jsonResult.tags.map(MappingUtils._toTag)
            })
        ;
        return dish;
    }
}