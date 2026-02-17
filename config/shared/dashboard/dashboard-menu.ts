import {
  dashBoardBookMark,
  dashBoardCategories,
  dashBoardPost,
  dashBoardSettings,
} from "@/config/shared/dashboard";
import { DashBoardType } from "@/types";

const dashBoardMenu: DashBoardType[] = [
  dashBoardPost,
  dashBoardBookMark,
  dashBoardCategories,
  dashBoardSettings,
];

export default dashBoardMenu;
