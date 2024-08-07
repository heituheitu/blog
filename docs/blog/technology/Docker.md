# Docker

### 核心

#### 容器、runtime

1. Java程序好比容器，jvm相当于runtime，容器在runtime中运行

2. docker默认runtime：runc，管理工具：docker engine包含deamon和cli两部分。通常提到的docker一般只docker engine

#### 容器定义工具

1. docker image：模版，runtime依据image创建容器
2. dockerfile：包含若干命令的文本文件，通过这些命令创建docker image

#### Registry

1. 统一存放image。 
2. docker Hub为docker为公众提供的Registry。

### 平台

#### 编排引擎

1. 基于容器的应用一般为微服务架构。不同的服务运行在各自的容器中，通过API对外提供服务。为了保证高可用，每个组件都可能运行多个相同的容器。这些容器组成集群，集群中容器会根据业务被动态创建、迁移、销毁。
2. 为了处理这种动态可伸缩，引入容器编排引擎。
3. 编排（orchestration）包括：容器管理、调度、集群定义和服务发现等。
4. Kubernetes是Google领导开发的开源容器编排引擎。

#### 支持技术

1. 容器网络
2. 服务发现
3. 监控
4. 数据管理
5. 日志管理
6. 安全性

### What

容器是一种轻量级、可移植、自包含的软件打包技术，使应用程序可以在任何地方以相同方式运行。

容器由两部分组成：

1. 应用程序本身
2. 依赖：应用程序需要的库，与操作系统的其他进程隔离。

容器和虚拟机最大区别：

1. 所有容器共享一个OS，虚拟机需要单独的OS
2. 容器启动不需要启动整个系统，体积小、开销小，虚拟机需要。

### Why

容器使软件具备可移植能力。

Docker将集装箱思想运用到软件打包上，为代码提供一个基于容器的标准化运输系统。

集装箱和容器的单词都是：Container。

容器是国内约定俗称的叫法，外国人思维可能Container只用到了集装箱的思想。

![image-2023061217254550](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCEecc63d674a4c232b8c5c58e267033dfe/10936)

### HOW

#### 架构

 核心组件

1. Docker客户端：Client
2. Docker服务器：Docker daemon
3. Docker镜像：Image
4. Registry
5. Docker容器：Container

![WX20230613-145650@2x](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCE3426dddc742b417b4f83858fa4429770/10940)

Docker采用Client/Server架构。客户端向服务器发送请求，服务器负责构建、运行和分发容器。C/S可以在同一台机器，C也可以通过stocket或Rest Api远程通信。

#### **客户端**

命令行界面，通过指令与服务器通信。

#### 服务端

Docker daemon是服务器组件，以后台服务的方式运行。默认只响应本地客户端的请求，可配置远程客户端请求。

#### Docker镜像

 可看成只读模版，通过它来创建Docker容器。

 例：某个image可能包含Ubuntu操作系统、一个Apache HTTP Server以及用户开发的web应用。

 多种生成方式：

1. 从无到有创建
2. 下载别人创建好的现成image
3. 在现有image上创建新的image

#### **Docker容器**

 是Docker image运行的实例。用户可以通过CLI（Docker）或者API启动、停止、移动或删除容器。

 可以这么理解：image是软件生命周期的构建和打包阶段，而容器则是启动和运行阶段。

#### Registry

 存放image的仓库，分为公有和私有。

 docker pull：可以从Registry下载image

 docker run：先下载image（如果本地没有），然后再启动容器。

 docker images：查看已有的image

 docker ps：显示运行的容器



### 镜像内部结构

#### base镜像

1. 不依赖其他镜像，从scratch构建
2. 其他镜像可以以之为基础扩展
3. 通常为各种Linux发行的Docker镜像，比如Ubuntu、Debian、CentOS等。
4. CentOS镜像大小大约为200M

Linux操作系统由内核空间和用户空间组成。

![WX20230614-193906](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCE2a5a150218dc4ec4ea8ff2d6e0e57a3c/10941)

内核空间是kernel，Linux刚启动时会加载bootfs文件系统，之后bootfs系统会被卸载掉。

用户空间的文件系统是rootfs，包含/dev、/proc、/bin等目录。

对于base镜像来说，底层直接用host的kernel，自己只需要提供rootfs就行。

对于精简OS，rootfs可以很小：基本命令、工具和程序库。平时安装的CentOS除了rootfs还有很多软件、服务、图形桌面等。

**base镜像只是在用户空间与发行版一致，kernel版本与发行版是不同的。**

#### 镜像分层结构

Docker支持通过扩展现有镜像，创建新的镜像。

![WX20230625-193700](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCE6356eb2c4ce58f7e378cd9970d76610f/10942)

优势：共享资源

比如：有多个镜像都从相同的base镜像构建，那么服务器只需要在磁盘上保存一份base镜像；同时内存中也只需加载一份base镜像，就可以为所有容器服务。

当容器启动时，一个新的可写层被加载到镜像的顶部。

**这一层通常被称作容器层，容器层下的都叫镜像层。**所有对容器的改动，都只会发生在容器层中，只有容器层是可写的，下面的镜像层都是只读的。

镜像层数量可能会很多，所有镜像层联合在一起组成统一的文件系统。如果不同层中有同一路径的文件，比如/a，上层的/a会覆盖下层的/a，用户只能访问到上层的/a。

只有当需要修改时才复制一份数据，这种特性被称作Copy-on-Write。容器层保存的是镜像变化的部分，不会对镜像本身进行任何修改。

#### 构建镜像

两种方式：

1. docker commit
2. Dockerfile

**docker commit**三个步骤：

1. 运行容器

   docker run -it ubuntu（-it参数的作用是以交互模式进入容器，并打开终端）

2. 修改容器

   apt-get install -y xxx

3. 保存为新镜像

   docker commit 

**Dockerfile**

是一个文本文件，底层也是docker commit一层一层构建镜像的。

```dockerfile
FROM ubuntu
RUN apt-get update && apt-get install -y vim
```

##### 过程分为两步

1. 构建镜像成为容器：docker build -t hahaha . 

   执行docker build命令, -t 对新镜像命名（hahaha)，命令末尾的.指明build context为当前目录。Docker默认会从这里查找DockerFIle文件，也可通过-f参数指定Dockerfile的位置。

```dockerfile
root@:~# pwd
/root
root@:~# docker build -t hahaha .
```

2. 运行容器：docker run hahaha

##### build context

首先Docker将build context中的所有文件发送给Docker daemon。build context为镜像构建提供所需要的文件或目录。
Dockerfile中的ADD、COPY等命令可以将build context中的文件添加到镜像。此例中，build context为当前目录 /root，该目录下的所有文件和子目录都会被发送给Docker daemon。
所以，使用build context就得小心了，不要将多余文件放到build context，特别不要把 /、/usr作为build context，否则构建过程会相当缓慢甚至失败

步骤：

1. 执行FROM ，将ubuntu作为base镜像
2. 执行RUN安装vim
3. 构建成功

**镜像分层结构**

新的镜像是通过base镜像的顶部添加一个新的镜像层得到的。

![WX20230704-180934@2x](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCE102d25a6c1b389fccb1415fca9fe84b9/10943)

docker history会显示镜像的构建历史，也就是Dokcerfile的执行过程。

![WX20230704-181103@2x](https://note.youdao.com/yws/public/resource/6755b73c733077a9dbf3967630e0e2b3/xmlnote/WEBRESOURCEc2a670aae9e74201179d7a88a630d566/10944)

此时多了97.07MB的一个镜像层。

##### 镜像层缓存特性

```dockerfile
FROM ubuntu
RUN apt-get update && apt-get install -y vim
#复制一个文件
COPY testfile/
```

如果增加新的镜像层之前，运行过相同的RUN指令，就直接使用缓存中的镜像层35ca89798937

如果不希望使用缓存在命令中加入--no--cache参数。

##### 缓存失效

Dockerfile中的每个指令都会创建一个镜像层，上层依赖下层，如果下层发生变化，那么上层的缓存就会失效。

```dockerfile
FROM ubuntu
#复制一个文件
COPY testfile/
RUN apt-get update && apt-get install -y vim
```

虽然逻辑上这种改动没有影响，但由于分层结构特性，Docker必须重建受影响的镜像层。

除了构建时候可以使用缓存，pull镜像的时候也会使用。

##### Dockerfile构建镜像过程

1. 从base镜像运行一个容器
2. 执行一条指令，对容器做修改
3. 执行类型docker commit操作，生成一个新的镜像层
4. Docker再基于刚刚提交的镜像运行一个新容器
5. 重复2-4步，直到Dockerfile中所有的指令执行完毕。

如果某个指令执行失败，也能够得到前一个指令生成的镜像，有助于调试。



##### Dockerfile常用命令

1. FROM：指定base镜像

2. COPY：将文件从builde context复制到镜像，支持两种形式：COPY src dest与COPY["src", "dest"]。 src为文件目录

3. ADD：与COPY类似，从build context复制文件到镜像。不同的是，如果src是归档文件（tar、zip、tgz、xz等），文件会被自动解压到dest。

4. ENV：设置环境变量，环境变量可以被后面的指令使用

5. RUN：在容器中运行指定的命令。

6. CMD：容器启动时运行指定的命令，Dockerfile可以有多个CMD命令，但只有最后一个生效。可以被docker run之后的参数替换，目的是不用更改Dockerfile。

   ```dockerfile
   FROM ubuntu:20.04
   
   # 设置工作目录
   WORKDIR /app
   
   # 复制应用程序文件到容器
   COPY . /app
   
   # 定义默认的CMD命令
   CMD ["python", "app.py"]
   ```

   docker build -t myapp .

   docker run myapp，会直接运行python的app.py文件

7. ENTRYPOINT：同样为容器启动时命令。不可以被docker run之后的参数替换，CMD用于补充该命令

   ```dockerfile
   FROM ubuntu:20.04
   ENTRYPOINT ["echo", "Hello"]
   CMD ["World!"]
   ```

   将打印出 "Hello World!"。

8. WORKDIR：为后面的指令RUN、ADD等指令设置当前工作目录



### 容器

#### 运行容器

1. docker run 启动容器，docker run后面可以跟CMD命令， --name显式的为容器命名
2. docker ps -a显示所有状态容器，退出状态为Exited
3. docker run -d 以后台方式启动容器，完成后返回容器唯一长ID。
4. docker ps看到的短ID是长ID的前12位
5. docker exec进入容器，docker exec -it以交互模式，打开一个新的bash终端，exit退出容器。
6. stop/start/restart容器
7. docker rm删除容器

### 资源限制

一个docker host上会运行若干容器，每个容器都需要CPU、内存和IO资源。

##### 容器可使用的内存：

1. 物理内存（RAM）：在计算机运行时为操作系统和各种程序提供临时储存。

2. swap（交换空间）它用于在物理内存（RAM）被完全使用时存放不再使用或者暂时不使用的数据。当系统运行内存紧张时，会利用交换空间存放部分数据，以便为其他程序提供更多可用内存。

设置内存

```dockerfile
#最多使用200m内存和100m的交换空间，默认都为-1，指没有限制
docker run -m 200m --memory-swap=300M ubuntu
```

如果在启动容器时只指定 -m而不指定 --memory-swap，那么 --memory-swap默认为 -m的两倍

##### CPU

默认情况下，容器使用主机CPU是不受控制的。如果不进行限制，出现异常使用CPU的现象，可能会把主机的CPU资源耗尽。

```dockerfile
#最多可以使用主机上的两个cpu的负载，并不是指定两个固定的cpu，极限时，是多个cpu综合起来是两个cpu的负载
docker run -it --rm --cpus=2 
#指定固定的cpu的负载，只在这个cpu上使用
docker run --it --rm --cpuset-cpus="1" u-stress:latest /bin/bash

#u-stress:latest：这是你要运行的Docker容器的名称。u-stress可能是用户名，latest是镜像的版本。
#/bin/bash：这是在容器启动后要执行的命令。在这种情况下，它启动一个bash shell，使你可以在容器内交互式地运行命令。
```

