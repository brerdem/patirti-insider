import React from 'react';
import {Alert, Linking} from 'react-native';
import {createAppContainer, NavigationActions} from 'react-navigation';
import AppNavigator from './components/navigation/AppNavigator';
import RNInsider from 'react-native-insider';
import * as firebase from 'react-native-firebase';
import compareVersions from 'compare-versions';
import codePush from 'react-native-code-push';
import SplashScreen from 'react-native-splash-screen';
import * as Sentry from '@sentry/react-native';
import sentryConfig from './config/sentry';
import {isNil, keys, pluck} from 'ramda';
import InsiderCallbackType from 'react-native-insider/src/InsiderCallbackType';


//disable yellow
console.disableYellowBox = true;




class App extends React.Component {





    navigateScreenFromPush = (navigationObj) => {
        if (this.navigator) {
            this.navigator.dispatch(
                NavigationActions.navigate(navigationObj),
            );
        } else {
            setTimeout(() => this.navigateScreenFromPush(navigationObj), 1000);
        }
    };

    componentDidMount() {

        SplashScreen.hide();



        //INSIDER

        const appGroup = Platform.OS === 'android' ? 'appgroup' : 'group.com.patirti.ios';
        RNInsider.init('patirtitest', appGroup, (type, payload) => {
            Alert.alert('test', JSON.stringify(payload));

            const data = !isNil(payload.aps) ? payload.aps : payload;

            switch (type) {
                case InsiderCallbackType.NOTIFICATION_OPEN:
                    console.log('ON_NOTIFICATION_OPEN: ', data);

                    this.navigateScreenFromPush({
                        routeName: data.product ? 'ProductDetail' : data.category ? 'Filter' : null,
                        params: data.product ? {sename: data.product} : data.category ? {
                            sename: data.category,
                            item: {title: data.categoryTitle},
                        } : null,
                    });

                    break;
                case InsiderCallbackType.INAPP_BUTTON_CLICK:
                    console.log('ON_INAPP_BUTTON_CLICK: ', data);
                    this.navigateScreenFromPush({
                        routeName: data.product ? 'ProductDetail' : data.category ? 'Filter' : null,
                        params: data.product ? {sename: data.product} : data.category ? {
                            sename: data.category,
                            item: {title: data.categoryTitle},
                        } : null,
                    });
                    break;
                case InsiderCallbackType.TEMP_STORE_PURCHASE:
                    console.log('ON_TEMP_STORE_PURCHASE: ', data);
                    break;
                case InsiderCallbackType.TEMP_STORE_ADDED_TO_CART:
                    console.log('ON_TEMP_STORE_PURCHASE: ', data);
                    break;
                case InsiderCallbackType.TEMP_STORE_CUSTOM_ACTION:
                    console.log('ON_TEMP_STORE_CUSTOM_ACTION: ', data);
                    break;
            }
        });

        /**/
        RNInsider.registerWithQuietPermission(false);

        RNInsider.startTrackingGeofence();







        //FIREBASE
        //firebase.config().enableDeveloperMode();
        firebase.config().fetch().then(() => firebase.config().activateFetched())
            .then(() => firebase.config().getValue('android_update_version'))
            .then((data) => {
                // Do something with data
                const remoteConfigVersion = data.val() || '0.0.0';
                const manifestVersion = '4.9.5';
                if (compareVersions(remoteConfigVersion, manifestVersion) === 1) {
                    Alert.alert(
                        'Yeni Versiyon Bulundu!',
                        'Güncellemek istiyor musunuz?',
                        [
                            {text: 'VAZGEÇ', onPress: null},
                            {
                                text: 'GÜNCELLE',
                                onPress: () => Linking.openURL('market://details?id=com.patirti').catch(err => console.log('err -->', err)),
                            },
                        ],
                        {cancelable: true},
                    );
                }
            })
            .catch((error) => console.log(`Error processing config: ${error}`));

    }

    render() {

        return (
           <View>
               <Text>Hello</Text>
           </View>

        );
    }
}

export default codePush(App);
