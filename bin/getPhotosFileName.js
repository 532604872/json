/**
 * @Description: 获取图片文件名
 * @Author: zero
 * @Date: 2020-10-21 16:33:20
 * @LastEditors: zero
 * @LastEditTime: 2020-10-21 16:33:20 
*/
// 执行命令 ：node bin/getPhotosFileName

const fs = require('fs')
const path = require('path')

let filePath = path.join(__dirname, '..', '/photos')
let photos = {} // 图片数据

let relativePath = path.join(__dirname, '..') // 相对路径

//文件遍历方法
function fileDisplay(filePath){
  try {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
      if(err){
        console.warn(err)
      }else{
        //遍历读取到的文件列表
        files.forEach(function(filename){
          //获取当前文件的绝对路径
          var filedir = path.join(filePath, filename);
          //根据文件路径获取文件信息，返回一个fs.Stats对象
          fs.stat(filedir,function(eror, stats){
            if(eror){
              console.warn('获取文件stats失败');
            }else{
              var isImage = /\.(jpg|jpeg|png|gif)$/i.test(filedir);//是图片
              var isFile = stats.isFile();//是文件
              var isDir = stats.isDirectory();//是文件夹
              if(isDir){
                fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
              }
              if(isFile && isImage){
                if (filename) {
                  let [a, b, c, d] = filename.replace(/\.(jpg|jpeg|png|gif)$/i,'').split(/[\-|\_]/)
                  d = d.trim()
                  if (!photos[d]) { // 工号去重
                    photos[d] = {
                      // filedir, // 图片路径 - 绝对路径
                      url: filedir.replace(relativePath, ''), // 图片路径 - 相对路径
                      department: a.trim(), // 部门
                      position: b.trim(), // 职位
                      name: c.trim(), // 姓名
                      number: d // 工号
                    }
                    // console.error('photos', photos[d])
                  }
                }
              } else if (isFile && !isImage) {
                console.error(filedir, filename)
              }
            }
          })
        });
        // console.log(`tips: "${filePath}/*" get to "fileName" success`)
      }
      writeFile(photos)
    });
  } catch (e) {
    console.log(e)
  }
}
//调用文件遍历方法
fileDisplay(filePath);


// 异步文件写入
function writeFile(photos) {
  // 打开文件
  fs.open('photos.json','w',function (err,fd) {
    // 判断是否出错
    if (!err){
      // 如何没有出错，则对文件执行写入操作
      fs.write(fd, JSON.stringify(photos),function (err) {
        if (!err){
          console.log('写入成功~~~');
        }
        fs.close(fd,function (err) {
          if (!err){
            console.log('文件已关闭~~~')
          }
        });
      });
    }else{
      console.warn(err)
    }
  })
}
