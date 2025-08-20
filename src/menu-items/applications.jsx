// third-party
import { FormattedMessage } from 'react-intl';

// project-imports
import { handlerCustomerDialog } from 'api/customer';
import { NavActionType } from 'config';

// assets
import {
  Add,
  Link1,
  KyberNetwork,
  Messages2,
  Calendar1,
  Kanban,
  Profile2User,
  Bill,
  UserSquare,
  ShoppingBag,
  SecuritySafe,
  Location,
  Buildings2,
  Category2,
  Box1,
  Barcode,
  WalletMinus,
  DollarCircle,
  Card,
  TruckTime,
  Warning2,
  Setting5,
  Danger,
  Send2,
  Cpu
} from 'iconsax-react';

// type

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  profile: UserSquare,
  ecommerce: ShoppingBag,
  add: Add,
  employee: Profile2User,
  link: Link1,
  control: SecuritySafe,
  location: Location,
  bu: Buildings2,
  pcat: Category2,
  box1: Box1,
  bcode: Barcode,
  expense: WalletMinus,
  sales: DollarCircle,
  credit: Card,
  purchase: ShoppingBag,
  order: TruckTime,
  warning: Danger,
  adj: Setting5,
  transfer: Send2,
  ai: Cpu
  // items: Box1
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: <FormattedMessage id="applications" />,
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'access-control',
      title: <FormattedMessage id="access-control" />,
      type: 'item',
      url: '/workspace/access-control',
      icon: icons.control,
      breadcrumbs: false
    },
    {
      id: 'employee',
      title: <FormattedMessage id="employee" />,
      type: 'item',
      url: '/workspace/employee',
      icon: icons.employee,
      breadcrumbs: false
    },
    {
      id: 'business-unit',
      title: <FormattedMessage id="business-unit" />,
      type: 'item',
      url: '/workspace/business-unit',
      icon: icons.bu,
      breadcrumbs: false
    },
    {
      id: 'location',
      title: <FormattedMessage id="location" />,
      type: 'item',
      url: '/workspace/location',
      icon: icons.location,
      breadcrumbs: false
    },
    {
      id: 'customer',
      title: <FormattedMessage id="customer" />,
      type: 'item',
      url: '/workspace/customer',
      icon: icons.customer,
      breadcrumbs: false
    },
    {
      id: 'product-category',
      title: <FormattedMessage id="product-category" />,
      type: 'item',
      url: '/workspace/product-category',
      icon: icons.pcat,
      breadcrumbs: false
    },
    {
      id: 'product-center',
      title: <FormattedMessage id="product-center" />,
      type: 'collapse',
      icon: icons.box1,
      children: [
        {
          id: 'products',
          title: <FormattedMessage id="products" />,
          type: 'item',
          icon: icons.box1,
          url: '/workspace/product-center/products',
          actions: [
            {
              type: NavActionType.LINK,
              label: 'Add Product',

              icon: icons.add,
              url: '/workspace/product-center/add-new-product'
            }
          ]
        },

        {
          id: 'adjustments',
          title: <FormattedMessage id="adjustments" />,
          type: 'item',
          icon: icons.adj,
          url: '/workspace/product-center/adjustments',
          actions: [
            {
              type: NavActionType.LINK,
              label: 'Add Product',
              icon: icons.add,
              url: '/workspace/product-center/add-adjustment'
            }
          ]
        },
        {
          id: 'stock-issues',
          title: <FormattedMessage id="stock-issues" />,
          type: 'collapse',
          icon: icons.warning,
          children: [
            {
              id: 'expire-products',
              title: <FormattedMessage id="expire-products" />,
              type: 'item',
              url: '/workspace/product-center/expires'
            },
            {
              id: 'overstocks',
              title: <FormattedMessage id="overstocks" />,
              type: 'item',
              url: '/workspace/product-center/overstocks'
            },
            {
              id: 'low-stocks',
              title: <FormattedMessage id="low-stocks" />,
              type: 'item',
              url: '/workspace/product-center/low-stocks'
            }
          ]
        }
      ]
    },
    {
      id: 'purchase',
      title: <FormattedMessage id="purchase" />,
      type: 'item',
      url: '/workspace/purchase/list',
      icon: icons.purchase,
      actions: [
        {
          type: NavActionType.LINK,
          label: 'Full Calendar',
          icon: icons.add,
          url: '/workspace/purchase/add-new-purchase'
        }
      ]
    },

    {
      id: 'barcodes',
      title: <FormattedMessage id="barcodes" />,
      type: 'item',
      url: '/workspace/barcode',
      icon: icons.bcode,
      breadcrumbs: false
    },
    {
      id: 'expense',
      title: <FormattedMessage id="expense" />,
      type: 'item',
      url: '/workspace/expense/list',
      icon: icons.expense,
      breadcrumbs: false,
      actions: [
        {
          type: NavActionType.LINK,
          label: 'Full Calendar',
          icon: icons.add,
          url: '/workspace/expense/add-expense'
        }
      ]
    },

    {
      id: 'order',
      title: <FormattedMessage id="order" />,
      type: 'item',
      url: '/workspace/order',
      icon: icons.order,
      breadcrumbs: false
    },

    // {
    //   id: 'sales',
    //   title: <FormattedMessage id="sales" />,
    //   type: 'item',
    //   url: '/workspace/sales',
    //   icon: icons.sales,
    //   breadcrumbs: false
    // },

    {
      id: 'sales',
      title: <FormattedMessage id="sales" />,
      type: 'collapse',
      icon: icons.sales,
      children: [
        {
          id: 'add-sales',
          title: <FormattedMessage id="add-sales" />,
          type: 'item',
          url: '/workspace/sales/add-sales',
          breadcrumbs: false
        },
        {
          id: 'sales-list',
          title: <FormattedMessage id="sales-list" />,
          type: 'item',
          url: '/workspace/sales/list',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'transfer',
      title: <FormattedMessage id="transfer" />,
      type: 'collapse',
      icon: icons.transfer,
      children: [
        {
          id: 'add-transfer',
          title: <FormattedMessage id="add-transfer" />,
          type: 'item',
          url: '/workspace/transfers/add-new-transfer',
          breadcrumbs: false
        },
        {
          id: 'transfer-list',
          title: <FormattedMessage id="transfer-list" />,
          type: 'item',
          url: '/workspace/transfers/list',
          breadcrumbs: false
        }
      ]
    },

    {
      id: 'ai',
      title: <FormattedMessage id="ai" />,
      type: 'item',
      url: '/workspace/ai',
      icon: icons.ai,
      breadcrumbs: false
    },
    {
      id: 'credit',
      title: <FormattedMessage id="credit" />,
      type: 'item',
      url: '/workspace/credit',
      icon: icons.credit,
      breadcrumbs: false
    },
    {
      id: 'chat',
      title: <FormattedMessage id="chat" />,
      type: 'item',
      url: '/workspace/chat',
      icon: icons.chat,
      breadcrumbs: false
    },
    {
      id: 'calendar',
      title: <FormattedMessage id="calendar" />,
      type: 'item',
      url: '/workspace/calendar',
      icon: icons.calendar,
      actions: [
        {
          type: NavActionType.LINK,
          label: 'Full Calendar',
          icon: icons.link,
          url: 'https://fullcalendar.io/docs/react',
          target: true
        }
      ]
    },

    // {
    //   id: 'customer',
    //   title: <FormattedMessage id="customer" />,
    //   type: 'collapse',
    //   icon: icons.customer,
    //   children: [
    //     {
    //       id: 'customer-list',
    //       title: <FormattedMessage id="list" />,
    //       type: 'item',
    //       url: '/workspace/customer/customer-list',
    //       actions: [
    //         {
    //           type: NavActionType.FUNCTION,
    //           label: 'Add Customer',
    //           function: () => handlerCustomerDialog(true),
    //           icon: icons.add
    //         }
    //       ]
    //     },
    //     {
    //       id: 'customer-card',
    //       title: <FormattedMessage id="cards" />,
    //       type: 'item',
    //       url: '/workspace/customer/customer-card'
    //     }
    //   ]
    // },
    {
      id: 'invoice',
      title: <FormattedMessage id="invoice" />,
      url: '/workspace/invoice/dashboard',
      type: 'collapse',
      icon: icons.invoice,
      breadcrumbs: false,
      children: [
        {
          id: 'create',
          title: <FormattedMessage id="create" />,
          type: 'item',
          url: '/workspace/invoice/create',
          breadcrumbs: false
        },
        {
          id: 'details',
          title: <FormattedMessage id="details" />,
          type: 'item',
          url: '/workspace/invoice/details/1',
          link: '/workspace/invoice/details/:id',
          breadcrumbs: false
        },
        {
          id: 'list',
          title: <FormattedMessage id="list" />,
          type: 'item',
          url: '/workspace/invoice/list',
          breadcrumbs: false
        },
        {
          id: 'edit',
          title: <FormattedMessage id="edit" />,
          type: 'item',
          url: '/workspace/invoice/edit/1',
          link: '/workspace/invoice/edit/:id',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'profile',
      title: <FormattedMessage id="profile" />,
      type: 'collapse',
      icon: icons.profile,
      children: [
        {
          id: 'user-profile',
          title: <FormattedMessage id="user-profile" />,
          type: 'item',
          link: '/workspace/profiles/user/:tab',
          url: '/workspace/profiles/user/personal',
          breadcrumbs: false
        },
        {
          id: 'account-profile',
          title: <FormattedMessage id="account-profile" />,
          type: 'item',
          url: '/workspace/profiles/account/basic',
          link: '/workspace/profiles/account/:tab',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'kanban',
      title: <FormattedMessage id="kanban" />,
      type: 'item',
      icon: icons.kanban,
      url: '/workspace/kanban/board',
      link: '/workspace/kanban/:tab',
      breadcrumbs: false
    }
  ]
};

export default applications;
