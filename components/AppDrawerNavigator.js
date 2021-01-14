import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {AppTabNavigator} from './AppTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import SettingsScreen from '../screens/SettingsScreen';
import MyDonationsScreen from '../screens/MyDonationsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MyReceivedBooksScreen from '../screens/MyReceivedBooksScreen';

export const AppDrawerNavigator = createDrawerNavigator({
    Home : {screen:AppTabNavigator},
    MyDonations : {screen:MyDonationsScreen},
    Settings : {screen:SettingsScreen},
    Notifications : {screen:NotificationsScreen},
    MyReceivedBooks : {screen:MyReceivedBooksScreen},
},{
    contentComponent : CustomSideBarMenu
},{
    initialRouteName : 'Home'
}) 