import React, { Component } from 'react';
import { Text, View, Image} from 'react-native';
import Tflite from 'tflite-react-native';
import { Asset } from 'expo-asset';


export default class HelloWorldApp extends Component {
  tflite = new Tflite();
  imagePath = './man.jpg';
  state = {
    isTfReady:false,
    isSegmentationReady: false,
    imageHeight: 550,
    imageWidth: 425,
    segemntation: '',
  }
  setModel(){
    this.tflite.loadModel({
      model: 'models/deeplabv3_257_mv_gpu.tflite',// required
      labels: 'models/deeplabv3_257_mv_gpu.txt',  // required
      numThreads: 1,                              // defaults to 1  
    },
    (err, res) => {
      if(err)
        console.log(err);
      else
        console.log(res);
    });
  }
  async segmentImage(){
    if(this.state.isSegmentationReady){
      return;
    }
    const asset = Asset.fromModule(require('./man.jpg'))
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    const imagePath = asset.localUri;
    this.path = imagePath;
    this.tflite.runSegmentationOnImage({
      path: imagePath,
      outputType: 'png'
    },
    async (err, res) => {
      if(err){
        console.log(err);
      }
      else{
        
        console.log("Successfully segmented the image")
        console.log(res);
        //const array = decodebase64(res,this.state.imageHeight,this.state.imageWidth);
        //const arrbsf = await tensorToImageUrl(array);
        //console.log(arrbsf)
        this.setState({
          isSegmentationReady:true,
          segemntation:res
        })
      }
    });
  }
  displaySegment(){
    if(this.state.isSegmentationReady){
      return (
        <View>
          <Image 
            style={{resizeMode:"contain",width:"50%",height:"50%"}}
            source={require('./man.jpg')}
            opacity={1}
          />
          <Image
              style={{ resizeMode:"contain",zIndex:200, width: "50%", height: "50%",top:-(this.state.imageHeight/1.45) }}
              source={{ uri: 'data:image/png;base64,'+this.state.segemntation }}
              opacity={0.5}
            />
        </View>
      );
    }else{
      return (
        <Text> Segmenting Iamge bro</Text>
      );
    }
    
  }
  run(){
    if(!this.state.isSegmentationReady){
      this.setModel();
      this.segmentImage();
    }
  }
  render() {
    return (
      <View style={{ backgroundColor:"#afafaf", flex:1,justifyContent: "center", alignItems: "center" }}>
        <Text>Hello, world! {this.run()}</Text>
        <View style={{backgroundColor:"#efefef",width:"80%",justifyContent:"center"}}>
          <Text>Segmented</Text>
          {this.displaySegment()}
        </View>
      </View>
    );
  }
}
