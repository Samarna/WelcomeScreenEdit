import React,{Component} from 'react';
import {View,Text,StyleSheet,KeyboardAvoidingView,TextInput,TouchableOpacity,Alert} from 'react-native';
import MyHeader from '../components/MyHeader.js';
import db from '../config';
import firebase from 'firebase';
import {BookSearch} from 'react-native-google-books';
import { FlatList, TouchableHighlight } from 'react-native-gesture-handler';

export default class BookRequestScreen extends Component {
    constructor(){
        super();
        this.state = {
            userId : firebase.auth().currentUser.email,
            bookName : '',
            reasonToRequest : '',
            author : '',
            bookStatus : '',
            requestedBookName : '',
            requestId : '',
            docId : '',
            isBookRequestActive : '',
            imageLink : '',
            dataSource : '',
            showFlatList : false,
        }
    }
    createUniqueId(){
        return Math.random().toString(36).substring(7);
    }
    getBookRequest=()=>{
        var bookRequest = db.collection("Requested_Books").where("User_Id","==",this.state.userId)
        .get().then((snapshot)=>{
            snapshot.forEach(doc=>{
                if(doc.data().Book_Status!=="received"){
                    this.setState({
                        requestId : doc.data().Request_Id,
                        requestedBookName : doc.data().Book_Name,
                        bookStatus : doc.data().Book_Status,
                        docId : doc.id,
                    })
                }
            })
        })
    }
    getIsBookRequestActive=()=>{
        db.collection("users").where("email_id","==",this.state.userId)
        .onSnapshot(snapshot=>{
            snapshot.forEach(doc=>{
                this.setState({
                    isBookRequestActive : doc.data().isBookRequestActive,
                    docId : doc.id,
                })
            })
        })
    }
    sendNotification=()=>{
        db.collection("users").where("email_id","==",this.state.userId)
        .get().then((snapshot)=>{
            snapshot.forEach(doc=>{
                var name = doc.data().first_name;
                var lname = doc.data().last_name;
                db.collection('All_Notifications').where("request_id","==",this.state.requestId)
                .get().then(snapshot=>{
                    snapshot.forEach(doc=>{
                        var donorId = doc.data().donor_id;
                        var bookName = doc.data().book_name;
                        db.collection("All_Notifications").add({
                            "targeted_user_id" : donorId, 
                            "message" : name +" " + lname + " received the book " + bookName , 
                            "notification_status" : "unread", 
                            "book_name" : bookName,
                        })
                    })
                })
            })
        })
    }
    updateBookRequestStatus=()=>{
        db.collection("Requested_Books").doc(this.state.docId)
        .update({
            Book_Status : "received",
        })
        db.collection("users").where("email_id","==",this.state.userId)
        .get().then(snapshot=>{
            snapshot.forEach(doc=>{
                db.collection("users").doc(doc.id).update({
                    isBookRequestActive : false,
                })
            })
        })
    }
    async getBooksFromAPI(bookName){
        this.setState({
            bookName : bookName,
        })
        if(bookName.length>2){
            var books = await BookSearch.searchbook(bookName,'AIzaSyBYts0TiMrRAUSvjY5KYtUyaKeBaJ6ImYw');
            console.log(books);
            this.setState({
                dataSource : books.data,
                showFlatList : true,
            })
        }
    }
    renderItem=({item,i})=>{
        return(
            <TouchableHighlight style={styles.bookSelect}
            activeOpacity={0.8} underlayColor="#DDDDDD" 
            onPress={()=>{
                this.setState({
                    showFlatList : false,
                    bookName : item.volumeInfo.title,
                })
            }} bottomDivider>
                <Text>{item.volumeInfo.title}</Text>
            </TouchableHighlight>
        )
    }
    addRequest=async(bookName,reasonToRequest,author)=>{
        var userId = this.state.userId;
        var randomRequestId = this.createUniqueId();
        var books = await BookSearch.searchbook(bookName,'AIzaSyBYts0TiMrRAUSvjY5KYtUyaKeBaJ6ImYw')
        db.collection('Requested_Books').add({
            "User_Id" : userId,
            "Book_Name" : bookName,
            "Author_Name" : author,
            "Reason_To_Request" : reasonToRequest,
            "Request_Id" : randomRequestId,
            "Book_Status" : "requested",
            "Date" : firebase.firestore.FieldValue.serverTimestamp(),
            "Image_Link" : books.data[0].volumeInfo.imageLinks.smallThumbnail,
        });
        this.getBookRequest();
        db.collection("users").where("email_id","==",userId).get()
        .then().then((snapshot)=>{
            snapshot.forEach(doc=>{
                db.collection("users").doc(doc.id).update({
                    isBookRequestActive : true
                })
            })
        })
        this.setState({
            bookName : '',
            reasonToRequest : '',
            author : '',
            requestId : randomRequestId,
        })
        return Alert.alert("Book Requested successfully!")
    }
    componentDidMount(){
        this.getBookRequest();
        this.getIsBookRequestActive();
    }
    render(){
        if(this.state.isBookRequestActive===true){
            return(
                <View style={styles.container}>
                    <View style={styles.bookRequestStyle}>
                        <Text style={{fontweight:"bold"}}>Book Name</Text>
                        <Text>{this.state.requestedBookName}</Text>
                    </View>
                    <View style={styles.bookRequestStyle}>
                        <Text style={{fontweight:"bold"}}>Book Status</Text>
                        <Text>{this.state.bookStatus}</Text>
                    </View>
                    <TouchableOpacity style={styles.receiveButton}onPress={()=>{
                        this.sendNotification();
                        this.updateBookRequestStatus();
                    }}>
                        <Text style={{justifyContent:"center"}}>I received the book!</Text>
                    </TouchableOpacity>
                </View>
            )
        }else{
            return(
                <View style = {{flex:1}}>
                    <MyHeader title="Request Books" navigation={this.props.navigation}></MyHeader>
                        <View>
                        <TextInput style={styles.formTextInput} placeholder="Enter book name" 
                        /*onChangeText={(text)=>{
                            this.setState({
                                bookName : text,
                            })
                        }}*/
                        onChangeText={(text)=>{
                            this.getBooksFromAPI(text);
                        }} 
                        onClear={(text)=>{
                            this.getBooksFromAPI('');
                        }} 
                        value={this.state.bookName}></TextInput>
                            {this.state.showFlatList?(
                                <FlatList data={this.state.dataSource} 
                                renderItem={this.renderItem} enableEmptySections={true}
                                style={{marginTop : 10}} keyExtractor={(item,index)=>{
                                    index.toString();
                                }}></FlatList>
                            ):(
                                <View style={{alignItems:'center'}}>
                                    <TextInput style={styles.formTextInput} placeholder="Enter book author" 
                                        onChangeText={(text)=>{
                                this.setState({
                                    author : text,
                                })
                                }} value={this.state.author}></TextInput>
                                <TextInput style = {[styles.formTextInput, {height : 300}]} 
                                multiline numberOfLines = {10} 
                                placeholder = "Why do you need the book?"
                                onChangeText={(text)=>{
                                    this.setState({
                                        reasonToRequest : text,
                                    })
                                }} value={this.state.reasonToRequest}></TextInput>
                                <TouchableOpacity style={styles.button}
                                onPress = {()=>{
                                    this.addRequest(this.state.bookName,this.state.reasonToRequest,this.state.author)
                                }}>
                                    <Text>Request</Text>
                                </TouchableOpacity>
                                </View>
                            )}
                    </View>
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    keyBoardStyle : { 
        flex:1, 
        alignItems:'center', 
        justifyContent:'center' 
    }, 
    formTextInput:{ 
        width:"75%", 
        height:35, 
        alignSelf:'center', 
        borderColor:'#ffab91', 
        borderRadius:10, 
        borderWidth:1, 
        marginTop:20, 
        padding:10, 
    }, 
    button:{ 
        width:"75%", 
        height:50, 
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius:10, 
        backgroundColor:"#ff5722", 
        shadowColor: "#000", 
        shadowOffset:{ width: 0, height: 8}, 
        shadowOpacity: 0.44, 
        shadowRadius: 10.32, 
        elevation: 16, 
        marginTop:20 
    }, 
    container:{ 
        flex : 1, 
        justifyContent: 'center' 
    }, 
    bookRequestStyle:{ 
        borderColor:"orange", 
        borderWidth:2, 
        justifyContent:'center', 
        alignItems:'center', 
        padding:10, margin:10 
    }, 
    receiveButton:{ 
        borderWidth:1, 
        borderColor:'orange', 
        backgroundColor:"orange", 
        width:200, 
        alignSelf:'center', 
        alignItems:'center', 
        justifyContent:'center', 
        height:30, 
        marginTop:10 
    },
    bookSelect: { 
        alignItems: 'center', 
        backgroundColor:'#DDDDDD', 
        padding : 10, 
        width : '50%' 
    }
})