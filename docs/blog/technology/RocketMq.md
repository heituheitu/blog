# RocketMQ



## 1.简介

 Rocketmq是java语言开发的分布式消息中间件，低延迟，高可用，拥有海量消息堆积能力和灵活拓展性的消息队列。

## 2.结构

 Rocketmq由四大核心模块组成：NameServer、Broker、Producer、Consumer

#### 1.Producer

 负责发送消息。使用producer将消费发送到brokerServer，由Broker对消息进行统一分发。

 Rocketmq支持多种消息发送方式：

- 同步消息发送

  生产者发送消息后会阻塞等待消息发送完成并接收到Broker的确认响应，然后再执行后续代码。保证消息可靠性，可能会降低发送吞吐量。

- 异步回调消息发送

  发送消息后立即返回，不等待Broker的响应。生产者提供一个回调函数处理发送结果。适合高吞吐量并能容忍一定消息丢失场景。

- 顺序消息发送

  支持按顺序发送消息，确保消息在同一个队列中按顺序消费。通过设置MessageQueueSelector控制消息发送到指定队列。

- 单向消息发送（异步无回调）

  发送消息后立即返回，不关心是否发送成功。

- 延时消息

  通过指定延时时间控制消息生产后，不要立即投递，在延时时间间隔后才对消费者可见。

 除了单向消息发送，其余的方式均需要Broker返回发送结果的确认消息。**Rocketmq一大特色是支持发送事务消息（半消息）**，能一定程度上解决分布式事务的问题。

#### 2.Consumer

 负责消费producer发送的消息。consumer会从Broker获取消息，并传递给应用程序。

 RocketMQ的回馈机制，消费者在消费完毕后，会发送一个ACK确认信息给消息队列(Broker)，Broker就知道该消息被消费了，就会将该消息从消息队列中删除。如果一定时间内没有接收到consumer消息确认消费的响应结果，会将同一条消息再次投递给consume，所以consumer可能会多次收到同一条消息，需要consumer业务方做好幂等防护。

 Rocketmq没有真正意义上的push，都是pull，虽然有push类，但实际底层实现采用的是**长轮询机制**，即拉取方式。

 Broker端属性 longPollingEnable 标记是否开启长轮询。默认开启。

#### 3.Broker

 负责消息的接收、存储、分发。（核心）

 为实现高可用、高吞吐，Broker通常采用集群部署，共同对外提供服务。

#### 4.NameServer

 负责提供路由元数据。维护Broker的路由信息，consumer和producer通过访问nameServer获得对应的Broker地址，再向Broker发起请求。起到解耦作用。

 nameServer可做集群，集群内的nameServer服务器不互相通信，保持相互独立。

![img](https://note.youdao.com/yws/public/resource/ed0aae2acf711ddeea9a5ff80d604e7a/xmlnote/WEBRESOURCE2f61e01c638ccf4d0c34a909cb2deb72/9224?ynotemdtimestamp=1700209609547)

## 3.基本概念模型

#### 1.topic主题

 代表一系列消息的集合，**任何消息只能属于一个topic主题**，主题是rocketmq进行消息发布订阅的最小单位。业务方可以通过创建并订阅各式各样的主题来满足自身的业务要求。**不同主题之间的消息在逻辑上没有关联**。

#### 2.tag标签

 从属于topic主题，主要对同一个topic主题下的消息近一步区分。标签可以简单的认为是二级主题，通过tag标签功能，业务方可以方便的实现对各种二级主题的消费需求。

#### 3.group组

 代表同一类实例集合，也可以称之为一个消费者或生产者集群。具体可分为消费者组（consumer group）和生产者组（producer group）两种。**消费者组合生产者组之间没有任何关联（即使组名一样）**。

 消费者组：

 消费者组代表同一类型的消费者集群。同一消费者组内的消费者通常消费同样的消息且消息消费逻辑一致。消费者组的概念使得consumer集群在消费消息时，rocketmq可以通过负载均衡来做到消费消息时的高可用和容错。

 生产者组：

 生产者组代表同一类型的生产者集群。rocketmq具有发送事务消息的特性，发送事务消息简单来说就是**生产者先发送出一个半消息（预消息），然后执行本地事务，在事务完成提交之后在跟着发送一个事务确认消息。** 半消息和普通消息最大的区别：半消息在投递给broker之后，broker不会马上让消费者消费，而是等待。只有当接收到生产者后续对应的事务确认消息后，预消息和确认消息合二为一，才将对应的事务消息发送给消费者消费；而如果最终没有接收到事务确认消息，则会将消息直接删除不投递给消费者，以达到类似事务回滚的效果。事务消息对消费者来说是透明无感知的。

 通过生产者组的概念，rocketmq实现了事务消息投递的高可用。

#### 4.message消息

 是rocketmq中传递消费的主体，消息具有全局唯一的messageID属性，用户可以根据messageID进行精准查询。

#### 5.死信消息

无法被正常消费并且无法被重新投递的消息。

原因：

1. 消息消费失败

2. 消息过期

3. 达到重试次数上限（代码里设置消息失败重试次数，正常为3次）

   ```java
    // 设置消息处理失败的重试次数
    consumer.setMaxReconsumeTimes(3);
    try {
      // 消息消费处理逻辑，这里简化为打印消息内容
      System.out.println("Received message: " + new String(msg.getBody()));
      // 模拟消费失败情况
      throw new Exception("Simulated consumer failure");
    } catch (Exception e) {
      // 消息消费失败，判断是否达到重试次数上限
      if (msg.getReconsumeTimes() >= consumer.getMaxReconsumeTimes()) {
        // 如果达到最大重试次数，将消息发送到死信队列
        Message newMsg = new Message("MyDLQTopic", msg.getBody());
        producer.send(newMsg);
        System.out.println("Message sent to DLQ: " + new String(msg.getBody()));
      } else {
        // 如果未达到最大重试次数，稍后由 RocketMQ 重试
        return ConsumeConcurrentlyStatus.RECONSUME_LATER;
      }
   ```

   

4. 被手动标记为死信消息

   死信消息通常被移动到专门的死信队列（DLQ，Dead Letter Queue），进行下一步处理、分析、审查。

```java
//死信队列是一个topic，下面的场景是消费失败后，将该消息生产到死信队列，并设置了一个自定义的属性 "FailureReason" 来标记这些消息是因为消费者失败而被发送到死信队列的。

try {
  // 处理消息，可能出现消费失败的情况
  // 如果消息处理失败，则将消息标记为死信消息
  // 这里简化为直接打印消息内容
  System.out.println("Received message: " + new String(msg.getBody()));
  // 模拟消费失败的情况
  throw new Exception("Simulated consumer failure");
} catch (Exception e) {
  // 消息消费失败，发送到死信队列
  // 可以通过设置消息的属性来标记为死信消息
  Message newMsg = new Message("MyDLQTopic", msg.getBody());
  newMsg.putUserProperty("FailureReason", "ConsumerFailure");
  producer.send(newMsg);
  e.printStackTrace();
  // 此处可根据实际情况进行日志记录或异常处理
}
```

作用：

1. **异常消息处理：** 死信队列提供了一个专门的存储区域，用于存放处理失败的消息。将消息标记为死信消息可以将处理失败的消息从主要的业务流程中分离出来，有助于更容易地定位和处理这些异常情况下的消息。
2. **故障排查与分析：** 将死信消息单独存放在队列中有助于系统故障排查和分析。这些消息可能包含有用的信息，例如失败原因、异常数据等，有助于发现系统中的问题，并进行诊断和修复。
3. **重新处理与补救：** 将消息发送到死信队列后，系统可以针对这些消息进行重新处理、修复或补救。这可以通过人工干预或者自动化的补救机制来实现，确保这些异常消息最终能够被正确处理。
4. **监控和统计：** 死信队列中的消息数量和内容可以作为系统监控和统计的一部分。通过监控死信队列中的消息情况，可以及时发现系统异常，从而做出相应的调整和改进。

#### 6.集群（Clustering）/广播（Broadcasting）消费

 集群消费：对于任意一条被订阅的消息，同一消费者组下的节点只有一个节点可以对其消费；一个消费者组中的全部节点分摊所有消息。

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/fc07a476b08d482eea332170c6f784fa2b0.png)

 广播消费：对于任意一条消息，同一消费者组的所有节点都会对其消费；一个消费者组中的全部节点都能接收到全量的消息。会多次消费。

![c464adc25745522c9cd7213602d2d206c67.png](http://www.qiniuyun.zhangzhendong.com/blog/image/c464adc25745522c9cd7213602d2d206c67.png)

 混合模式消费：对于任意一条被订阅的消息，同一消费者组之间只会有一个节点对其进行消费，不同消费者组都会进行全量消息的消费。

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/53fe61e030ae77d21e9108a7cd6e00af80b.png)

消费点位offset：集群模式下broker 存储 offset 的值，采用 RemoteBrokerOffsetStore；广播模式下采用 LocalFileOffsetStore，消费端存储offset的值。

重置消费点位：可以让消费者从指定的位置重新开始消费消费

跳过消息堆积：直接从最新的消息开始消费。 消费堆积原因：消费者系统性能不足或消费速度低于生产速度。

消费者端配置，默认为集群模式

```java
//messageModel = MessageModel.BROADCASTING 设置为广播模式
@RocketMQMessageListener(consumerGroup = "消费者组", topic = "主题", selectorExpression = "Quick_message_push",messageModel = MessageModel.BROADCASTING)
```



## 4.集群部署模式

| 集群方式               | 运维特点                       | 消息可靠性(master宕机情况)       | 服务可用性(master宕机情况)                                   | 其他特点                                        | 备注                                               |
| ---------------------- | ------------------------------ | -------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------- |
| 单Master               | 结构简单，扩容方便，机器要求低 | 同步刷盘消息一条都不会丢         | 整体可用，未被消费的消息无法取得，影响实时性                 | 性能最高                                        |                                                    |
| 多Master               |                                | 异步有毫秒级丢失，同步双写不丢失 | 差评，主备不能自动切换，且备机只能读不能写，会造成服务整体不可写 |                                                 | 不考虑，除非自己提供主从切换的方案                 |
| Master-Slave(异步复制) | 结构复杂，扩容方便             | 故障时会丢失消息                 | 整体可用，实时性影响毫秒级别                                 |                                                 |                                                    |
| Master-Slave(同步双写) | 结构复杂，扩容方便             | 不丢消息                         | 整体可用，不影响实时性，该组服务只能读不能写                 | 性能比异步低10%，所以实时性也并不比异步方式太高 | 适合消息可靠性略高，实时性中等、性能要求不高的需求 |

## 5.问题

##### 1.为什么要使用MQ？

 分布式系统中，所有远程服务调用请求如果同步执行的话会出现问题。

| 作用 | 描述                                                         |
| ---- | ------------------------------------------------------------ |
| 解耦 | 系统耦合度降低，没有强依赖关系                               |
| 异步 | 不需要同步执行的远程调用可以有效提高响应时间                 |
| 削峰 | 请求达到峰值后，后端service还可以保持固定消费速率消费，不会被压垮 |

##### 2.Rocketmq Broker中的消息被消费后会立即删除么？

 不会，每条消息都会持久化到CommitLog中，每个Consumer连接到Broker后会维持消费进度信息，当有消息消费后只是当前的Consumer的消费进度（CommitLog的offset）更新了。

##### 3.什么时候清理过期消息？

 4.6版本后默认48小时后删除不再使用的CommitLog文件。

##### 4.为什么主动拉取消息而不是使用事件监听方式？

 事件驱动方式是建立好长连接，由事件（发送数据）的方式来实时推送。

 如果broker主动推送消息的话，有可能push速度快，消费速度慢的情况，那么就会造成消息在consumer端堆积过多，同时又不能被其他consumer消费的情况。而pull的方式可以根据当前自身情况来pull，不会造成过多的压力而造成瓶颈。所以采取了pull的方式。

##### 5.消息重复消费？

 影响消息正常发送和消费的重要原因是**网络的不确定性**。

 引起重复消费的原因：

- ACK

  正常情况下，Consumer消费一条消息后应该发送ACK，通知broker该消息已经正常消费，从queue中剔除。

  如果ACK因为网络原因没有发送到broker，broker会认为这条消息没有被消费，此后会开启消息重投机制把消息再次推送到Consumer。

- 消费模式

  在Clustering模式下，消息在broker中会保证相同group的consumer消费一次，但是针对不同的group的consumer会推送多次。
  在广播消费模式下，也会重复消费。

 解决方案：

- Redis分布式锁

  以messageID为key，失效时间为2分钟，第一次消费，存入缓存，下次消费如果缓存为空，进行消费，如果不为空，则忽略消息。

##### 6.如何让Rocketmq保证顺序消费？

 RocketMQ可以严格的保证消息有序。但这个顺序，不是全局顺序，只是分区（queue）顺序，queue是典型的FIFO。要全局顺序只能一个分区。

 如果一个topic有多个queue，那么生产多条消息的时候，会存储在多个queue中，每个queue会被consumer消费，那么并行消费的时候是无法保证顺序的。

 解决：同一个topic只往同一个queue中发送消息，消费的时候只能从该queue中消费。

 重写MessageQueueSelector接口，比如取模判断`i % 2 == 0`，那就都放到queue1里，否则放到queue2里。

```
// RocketMQ默认提供了两种MessageQueueSelector实现：随机/Hash，使用orderId同一队列
SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        Integer id = (Integer) arg;
        int index = id % mqs.size();
        return mqs.get(index);
    }
}, orderId);
```

##### 7.保证消息不丢失？

可能会丢失的情况：

- Producer端

  采用send()同步发送消息，发送结果是同步感知的。

  发送失败可以重试，设置重试次数，默认3次。

  ```java
  producer.setRetryTimesWhenSendFailed(10);
  ```

  集群部署，发送失败原因可能是Broker宕机了，重试的时候会发送到其他Broker上。

- Broker端

  修改刷盘策略为同步策略。默认情况下是异步刷盘。

  ```java
  flushDiskType = SYNC_FLUSH
  ```

  集群部署，主从模式，高可用。

- Consumer端

  完全消费正常后再进行手动ack确认。

##### 8.Broker把自己的信息注册到哪个NameServer上？

Broker会向所有的NameServer上注册自己的信息，而不是某一个，是每一个，全部！