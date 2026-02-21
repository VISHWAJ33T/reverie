import {
  dashBoardAbout,
  dashBoardBookMark,
  dashBoardCategories,
  dashBoardPost,
  dashBoardSettings,
  dashBoardUsers,
} from "@/config/shared/dashboard";
import { DashBoardType } from "@/types";

const dashBoardMenu: DashBoardType[] = [
  dashBoardPost,
  dashBoardBookMark,
  dashBoardCategories,
  dashBoardAbout,
  dashBoardUsers,
  dashBoardSettings,
];

export default dashBoardMenu;
