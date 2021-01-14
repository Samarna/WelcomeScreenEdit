import React, { Component } from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {Avatar} from 'react-native-elements';
import { DrawerItems } from 'react-navigation-drawer';
import firebase from 'firebase';
import {TouchableOpacity} from 'react-native-gesture-handler';
import db from '../config';
import * as ImagePicker from 'expo-image-picker';

export default class CustomSideBarMenu extends Component{
    constructor(){
        super();
        this.state={
            userId : firebase.auth().currentUser.email,
            image :"#",
            name : "",
            docId : "",
        }
    }
    getUserProfile=()=>{
        db.collection("users").where("email_id","==",this.state.userId)
        .onSnapshot(snapshot=>{
            snapshot.forEach(doc=>{this.setState({
                name : doc.data().first_name+" "+doc.data().last_name,
                docId : doc.id,
                image : doc.data().image,
            })})
        })
    }
    uploadImage=async(uri,imageName)=>{
        var response = await fetch(uri);
        var blob = await response.blob();
        var ref = firebase.storage().ref().child("UserProfile/"+imageName);
        return ref.put(blob).then(response=>{this.fetchImage(imageName)})
    }
    fetchImage=(imageName)=>{
        var storageRef = firebase.storage().ref().child("UserProfile/"+imageName);
        storageRef.getDownloadURL().then((url) => { 
            this.setState({ image: url }); }) 
            .catch((error) => { 
                this.setState({ image: "#" }); 
            });
    }
    selectPicture=async()=>{
        console.log("select-picture");
        const {cancelled,uri} = await ImagePicker.launchImageLibraryAsync({
            mediaTypes : ImagePicker.MediaTypeOptions.All,
            allowsEditing : true,
            aspect : [4,3],
            quality : 1,
        })
        if(!cancelled){
            this.uploadImage(uri,this.state.userId);
        }
    }
    componentDidMount(){
        this.getUserProfile();
        this.fetchImage(this.state.userId);
    }
    render(){
        return(
            <View style = {styles.container}>
                <View style = {styles.profileContainer}>
                    <Avatar rounded source = {{
                        uri : this.state.image
                    }} size={"xlarge"} 
                    showEditButton onPress={()=>{
                        this.selectPicture();
                    }}></Avatar>
                    <Text style={styles.profileName}>{this.state.name}</Text>
                </View>
                <View style = {styles.drawerItemsContainer}>
                    <DrawerItems {...this.props}></DrawerItems>
                </View>
                <View style = {styles.logOutContainer}>
                    <TouchableOpacity style = {styles.logOutButton} 
                    onPress = {
                        ()=>{
                            this.props.navigation.navigate('welcomeScreen');
                            firebase.auth().signOut();
                        }
                    }>
                        <Text style = {styles.logOutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({ 
    container : { 
        flex : 1 
    }, 
    drawerItemsContainer:{ 
        flex : 0.5 
    }, 
    logOutContainer : { 
        flex:0.2, 
        justifyContent:'flex-end', 
        paddingBottom:20 
    }, 
    logOutButton : { 
        height:30, 
        width:'100%', 
        justifyContent:'center', 
        padding:5, 
    }, 
    logOutText:{ 
        fontSize: 20, 
        fontWeight:'bold' 
    },
    profileContainer : { 
        flex : 0.5, 
        alignItems : 'center', 
        justifyContent: 'center', 
        backgroundColor: 'orange' 
    }, 
    profileName : { 
        fontWeight: "100", 
        fontSize: 20, 
        paddingTop: 10 
    }, 
    imageContainer: { 
        flex: 0.75, 
        width: "40%", 
        height: "25%", 
        marginLeft: 10, 
        marginTop: 30, 
        borderRadius: 40, 
    }, 
})