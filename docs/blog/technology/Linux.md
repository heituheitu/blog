# Linux

### **shell：**

 	1. Shell是Linux系统的用户界面，提供了用户与内核进行交互操作的一种接口。**如：Windows中的cmd.exe类似这个角色,不过接收的是DOS命令**
 	2. 是在Linux内核与用户之间的解释器程序，现在Linux通常用/bin/bash解释器来负责向内核翻译以及传达用户/程序指令，shell相当于操作系统的“外壳”。
 	3. 解释器版本：
 	 - bash：bash 是一个为GNU计划编写的Unix shell。是许多Linux发行版的默认Shell 。同时兼顾对sh的兼容。
 	 - csh：随BSD UNIX发布。
 	 - ksh：向后兼容sh的功能，并且添加了csh引入的新功能。
 	 - tcsh：是csh的增强版本。
 	4. 使用cat /etc/shells 指令查看自己系统可以使用的shell种类。
 	5. 用户的默认Shell设置在/etc/passwd文件中。

#### 命令行：

 命令行的一般格式:

**命令字  [选项]  [参数]**

命令字区分大小写

#### exec：

exec 命令通常用在 Shell 脚本程序中，可以调用其他的命令。如果在当前终端中使用命令，则当指定的命令执行完毕后会立即退出终端。

[exec命令_Linux exec 命令用法详解：调用并执行指定的命令 (ailinux.net)](http://lnmp.ailinux.net/exec)

### 防火墙

firewall-cmd --zone=public --list-ports 查看所有开启的端口号

firewall-cmd --zone=public --add-port=18002/tcp --permanent 添加端口号

firewall-cmd --zone=public --remove-port=80/tcp --permanent 删除端口号

firewall-cmd --reload 重启防火墙

### 查看进程

ps命令是Process Status的缩写, 用来列出系统中当前运行的那些进程，显示当前进程的快照。
-e显示所有进程，-f 为把进程的所有信息都显示出来。

aux:a显示所有用户进程，u显示所有用户，x显示无控制中端的进程

&  表示任务在后台执行，如要在后台运行redis-server,则有  redis-server &

&& 表示前一条命令执行成功时，才执行后一条命令 ，如 echo '1‘ && echo '2'    

| 表示管道，上一条命令的输出，作为下一条命令参数，如 echo 'yes' | wc -l

|| 表示上一条命令执行失败后，才执行下一条命令，如 cat nofile || echo "fail"

### 查看所有端口

netstat -ntlp

### 根据端口查看进程号

netstat -nap | grep 端口号

### 切换多个jdk

alternatives --config java