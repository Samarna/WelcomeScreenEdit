import React, {Component} from 'react';
import {View,Text,StyleSheet, TouchableOpacity} from 'react-native';
import firebase from 'firebase';
import db from "../config";
import MyHeader from '../components/MyHeader';
import { Icon,Card } from 'react-native-elements';

export default class ReceiverDetailsScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            userId : firebase.auth().currentUser.email,
            userName : "",
            receiverId : this.props.navigation.getParam("details")["User_Id"],
            requestId : this.props.navigation.getParam("details")["Request_Id"],
            bookName : this.props.navigation.getParam("details")["Book_Name"],
            authorName : this.props.navigation.getParam("details")["Author_Name"],
            reasonForRequesting : this.props.navigation.getParam("details")["Reason_To_Request"],
            receiverName : '',
            receiverContact : '',
            receiverAddress : '',
            receiverRequestDocId : '',
        }
    }
    getUserName=(userId)=>{
        db.collection('users').where('email_id','==',userId)
        .get().then((snapshot)=>{
            snapshot.forEach((doc)=>{
                this.setState({
                    userName : doc.data().first_name+" "+doc.data().last_name,
                })
            })
        })
    }
    addNotifications=()=>{
        var message = this.state.userName+" has shown interest in donating the book!";
        db.collection('All_Notifications').add({
            donor_id : this.state.userId,
            targeted_user_id : this.state.receiverId,
            request_id : this.state.requestId,
            book_name : this.state.bookName,
            date : firebase.firestore.FieldValue.serverTimestamp(),
            notification_status : "unread",
            message : message,
        })
    }
    updateBookStatus=()=>{
        console.log("Entered updateBookStatus!");
        db.collection('All_Donations').add({
            Book_Name:this.state.bookName, 
            Request_Id:this.state.requestId, 
            Requested_By:this.state.receiverName,
            Donor_Id:this.state.userId,
            Request_Status:"Donor Interested!",
        })
    }
    getReceiverDetails(){
        console.log(this.state.receiverId+','+this.state.requestId);
        db.collection('users').where('email_id','==',this.state.receiverId).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                console.log(doc.data());
                this.setState({
                    receiverName : doc.data().first_name,
                    receiverContact : doc.data().contact,
                    receiverAddress : doc.data().address,
                })
            })
        })
        db.collection('Requested_Books').where('Request_Id','==',this.state.requestId).get()
        .then(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    receiverRequestDocId : doc.id,
                })
            })
        })
    }
    componentDidMount(){
        this.getReceiverDetails();
        this.getUserName(this.state.userId);
    }
    render(){
        return(
            <View style = {styles.container}>
                <View style = {{flex : 0.1}}>
                    <MyHeader leftComponent = {
                        <Icon name = "arrow-left" 
                        type = 'feather' 
                        color = '#696969' 
                        onPress = {()=>{
                            this.props.navigation.goBack();
                            }
                        }></Icon>
                    } centerComponent = {{
                        text : 'Donate Books',
                        style : {color : '#90A5A9', fontSize : 20, fontWeight : 'bold'}
                    }} backgroundColor = '#EAF8FE'></MyHeader>
                </View>
                <View style = {{flex:0.45}}>
                    <Card title = {'Book Information'} titleStyle = {{fontSize : 20}}>
                        <Card>
                            <Text style = {{fontWeight : 'bold'}}>Name : {this.state.bookName}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight : 'bold'}}>Reason : {this.state.reasonForRequesting}</Text>
                        </Card>
                    </Card>
                </View>
                <View style = {{flex:0.4}}>
                    <Card title = {'Receiver Information'} titleStyle = {{fontSize : 20}}>
                        <Card>
                            <Text style = {{fontWeight : 'bold'}}>Name : {this.state.receiverName}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight : 'bold'}}>Contact : {this.state.receiverContact}</Text>
                        </Card>
                        <Card>
                            <Text style = {{fontWeight : 'bold'}}>Address : {this.state.receiverAddress}</Text>
                        </Card>
                    </Card>
                </View>
                <View style = {styles.buttonContainer}>{this.state.receiverId!=this.state.userId?
                (
                    <TouchableOpacity style = {styles.button} onPress = {()=>{
                        this.updateBookStatus();
                        this.addNotifications();
                        this.props.navigation.navigate('MyDonations');
                    }}>
                        <Text>I want to donate!</Text>
                    </TouchableOpacity>
                ):null}</View>
            </View>
        )
    }
}
const styles = StyleSheet.create({ 
    container: { 
        flex:1,
    }, 
    buttonContainer : { 
        flex:0.3, 
        justifyContent:'center', 
        alignItems:'center' 
    }, 
    button:{ 
        width:200, 
        height:50, 
        justifyContent:'center', 
        alignItems : 'center', 
        borderRadius: 10, 
        backgroundColor: 'orange', 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 8 }, 
        elevation : 16 
    } 
})