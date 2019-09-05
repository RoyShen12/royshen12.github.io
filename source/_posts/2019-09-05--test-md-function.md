---
title: 功能测试文章
tags: [测试]
categories:
  - 博客技术
date: 2019-09-05 09:47:00
---

# 这是一级标题
## 这是二级标题
### 这是三级标题
#### 这是四级标题
##### 这是五级标题
###### 这是六级标题

**这是加粗的文字**  
*这是倾斜的文字*  
***这是斜体加粗的文字***  
~~这是加删除线的文字~~  


>这是引用的内容
>>这是引用的内容
>>>>这是引用的内容

分割线
---
分割线
----
分割线
***
分割线
*****

### 这是本地图片
![結城友奈は勇者である](/55394787_p0.jpeg)  

### 这是外链图片（来自阿里云 OSS 存储）
![結城友奈は勇者である](https://image-bed-roy.oss-cn-shanghai.aliyuncs.com/image-blog/f1a7e26a2ecd271ece638d5115b014c3.jpeg)

### 超链接
[简书](http://jianshu.com)
[百度](http://baidu.com)

- 列表内容
+ 列表内容
* 列表内容

1. 列表内容
2. 列表内容
3. 列表内容

表头|表头|表头
---|:--:|---:
内容|内容|内容
内容|内容|内容


`console.log("单行代码内容")`

```ts
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
```

```js
cFx = new Proxy(cFx, {
  apply(target, thisArg, argumentsList) {
    const return_value = Reflect.apply(target, thisArg, argumentsList)

    if (return_value === 0)
      return argumentsList[2][indexSymbol] - argumentsList[3][indexSymbol]
    else
      return return_value
  }
})
```

```cpp
const auto loop = [this](int value, int ri, int ci) {
  if (value == 0) {
    auto r = this->get_lack(LackType::row, ri);
    auto c = this->get_lack(LackType::col, ci);
    auto b = this->get_lack(LackType::block, (int)floor(ri / 3.0) * 3 + (int)floor(ci / 3.0));
    auto intersection = get_vector_intersection<int>(r, c, b);
    return make_shared<vector_i32>(intersection);
  }
  return shared_ptr<vector_i32>(nullptr);
};
```

### 评论测试
  
<Valine></Valine>
