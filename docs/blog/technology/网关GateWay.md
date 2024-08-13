# 网关GateWay

## 1.简介

  网关：在网络层以上实现网络互联，仅用于高层协议不同的网络互联。比如两个相互独立的局域网之间通过路由器进行通信，中间的路由称之为网关。

  目前，比较流行的网关有：Nginx 、 Kong 、Orange等等，还有微服务网关Zuul 、Spring Cloud Gateway等。

  API网关是一个服务器，是系统的唯一入口。从面向对象设计的角度看它与外观模式类似。可以是系统与系统之间，也可以是客户端与服务端之间。

  API网关封装了系统内部架构，为每个客户端提供一个定制的API。还有其他职责：身份验证、监控、负载均衡、缓存、请求分片与管理、静态响应处理。

  核心要点：所有客户端都通过统一的网关接入微服务，在网关层处理非业务功能。

  通常，网关是提供REST/HTTP的访问API。服务端通过API-GW注册和管理服务。



## 2.API网关架构

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/20180302164709853.png)API网关拆分为3个系统:

- Gateway-core（核心）
- Gateway-Admin（管理）
- Gateway-Monitor（监控）

Gateway-core：负责接收客户端请求，调度、加载和执行组件，将请求路由到上游服务端，并处理返回结果。

Gateway-Admin：网关管理页面，可以对API、组件的系统基础信息进行配置。

Gateway-Monitor：监控日志、生成运维报表等。



## 3.API网关实现的功能

#### 1.负载均衡

  每次用户请求都会通过负载均衡算法，路由到对应的服务上。例如：随机算法、权重算法、Hash算法等。

#### 2.路由选择

  根据请求的URL地址解析，知道需要访问的服务。再通过路由表把请求路由到目标服务上。

  由于网络原因，服务暂时不可用，可以通过设置对服务进行重试，并定义重试次数。

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/9e2712cf9fac9a3fd75a3eb273c2315b.jpg)

#### 3.流量控制

  当上游服务超出请求承载范围，导致服务处理能力下滑。API网关作为”看门人“，就可以限制流入的请求，让服务器免受冲击。有令牌桶算法、漏桶算法、链接数限制等。

#### 4.统一鉴权

  把权限认证统一放到API网关进行。

  步骤：

1. 用户通过登录服务获取Token，存在客户端
2. 请求时，将Token放在请求头，一起发送给服务器
3. API网关解析Token，知道访问者是谁（鉴定），他能做什么（权限）
4. 根据权限执行下一步操作

#### 5.熔断降级

  当应用服务出现异常，API网关把请求导入到其他服务上，或者对服务进行降级处理（FallBack接口方法）。

#### 6.缓存数据

  ![img](http://www.qiniuyun.zhangzhendong.com/blog/image/c39ec9b3058b1e77c48abc42cdcaab77.jpg)

#### 7.日志记录

  通过API网关过滤器加入日志服务，记录请求和返回信息。

  具体可以做报表分析、实时查询、异常警告、日志投递等。

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/70ef5571ded6f9a05be25c08b65650d1.jpg)



## 4.框架（SpringCloud Gateway）

#### 1.简介

 Gateway旨在为微服务架构提供一种简单有效且统一的API路由管理方式。使用的Webflux中的reactor-netty响应式编程组件，底层使用了Netty通讯框架。

特征：

1. 集成Hystrix断路器
2. 集成 Spring Cloud DiscoveryClient
3. Predicates和Filters作用于特定路由
4. 具备网关的高级功能：动态路由、限流、路径重写

术语：

1. Filter（过滤器）

   拦截和修改请求，对上游的响应进行二次处理。

2. Route（路由）

   网关配置的基本组成模块。一个Route模块由一个ID，一个目标URI，一组断言和一组过滤器定义。如果断言为真，则路由匹配，目标URI会被访问。

3. Predicate（断言）

   这是一个java 8的Predicate，可以使它来匹配来自HTTP请求的任何内容，例如headers或参数。断言输入类型是一个ServerWebExchange。

#### 2.处理流程

1. 客户端向Gateway发起请求。
2. 在Gateway Handler Mapping中找到与请求相匹配的路由，发送到Gateway Web Handler。
3. Handler通过指定的过滤器链将请求发送到实际的服务中。
4. 实际服务执行业务逻辑，返回

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/1240)

#### 3.配置

1. 基础URI路由配置方式

   ```yml
   spring:
     application:
       name: api-gateway
     cloud:
       gateway:
         routes:
           -id: seckill-provider-route
           uri: http://localhost:8080/seckill-provider
           predicates:
           - Path=/seckill-provider/**
           
           -id: message-provider-route
           uri: http://localhost:8080/message-provider
           predicates:
           -Path=/message-provider/**
   ```

   - id：自定义路由ID，保持唯一
   - uri：目标服务地址
   - predicates：路由条件，Predicate 接受一个输入参数，返回一个布尔值结果。该接口包含多种默认方法来将 Predicate 组合成其他复杂的逻辑（比如：与，或，非）。

   配置含义：配置一个id为seckill-provider-route的代理规则，路由的规则为：当访问地址为http://localhost:8080/seckill-provider/1.jsp时，会路由到上游地址 lb://seckill-provider/1.jsp

#### 4.匹配规则

  Spring Cloud Gateway 是通过 Spring WebFlux 的 HandlerMapping 做为底层支持来匹配到转发路由，SpringCloud Gateway内置了很多Predicate工厂，通过不同的HTTP请求参数匹配，多个Predicate工厂可以组合使用。

1. Predicate断言

   Predicate来源于java8，Predicate接受一个输入函数，返回一个布尔值结果。该接口包含多种默认方法来将Predicate组合成其他复杂的逻辑（比如：与、或、非）。

   ![img](http://www.qiniuyun.zhangzhendong.com/blog/image/strip)

   说白了Predicate就是为了实现一组匹配规则，方便请求过来找到对应的Route处理。

2. 配置

   ```yml
   .....
    ...
     predicates:
       #这样配置，只要请求中包含 smile 属性的参数即可匹配路由。
      -Query=smile  
      #请求中包含 keep 属性并且参数值是以 pu 开头的长度为三位的字符串才会进行匹配和路由。
      -Query=keep, pu. 
      #接收 2 个参数，一个 header 中属性名称和一个正则表达式
      - Header=X-Request-Id, \d+ 
      #一个是 Cookie name ,一个是正则表达式
      - Cookie=sessionId, test 
      #接收一组参数，一组匹配的域名列表
      - Host=**.baidu.com
      #可以通过是 POST、GET、PUT、DELETE 等不同的请求方式来进行路由。
      - Method=GET
      #接收一个匹配路径的参数来判断是否走路由。
      -Path=/foo/{segment}
      #通过设置某个 ip 区间号段的请求才会路由
      - RemoteAddr=192.168.1.1/24
   ```

   上述断言，可单个使用，也可以组合使用。



#### 5.高级功能

##### 1.熔断降级

为什么要实现熔断降级？

  在分布式系统中，网关作为流量入口，因此会有大量的请求进入网关，向其他服务发起调用，其他服务不可避免会发生调用失败（超时、异常），失败的不能让请求堆积在网关上，需要快速失败并返回给客户端，所以就必须在网关上做熔断、降级操作。

为什么要网关请求失败需要快速返回给客户端？

  当一个客户端请求发生故障时，这个请求会一直堆积在网关上，如果请求堆积过多，就会给网关乃至整个服务器造成巨大压力。因此需要对一些服务和页面进行有策略的降级，缓解服务器资源的压力。

```yml
spring:
  application:
    name: gateway
  cloud:
    gateway:
      routes:
        - id: rateLimit_route
          uri: http://localhost:8000
          order: 0
          predicates:
            - Path=/test/**
          filters:
            - StripPrefix=1
            - name: Hystrix
              args:
                name: fallbackCmdA
                fallbackUri: forward:/fallbackA
                hystrix.command.fallbackCmdA.execution.isolation.thread.timeoutInMilliseconds: 5000
```

配置了两个过滤器：

1. stripPrefix：作用是去掉请求路径最前面n个部分截取掉。

   =1代表截取路径个数为1，比如请求是/test/good/view，匹配成功后，路由到后端的请求就会变成http://localhost:8000/good/view

2. Hystrix：作用是通过Hystrix进行熔断降级。

   当上游的请求进入Hystrix降级机制时，就会调用fallbackUri配置的降级地址。还需要单独设置Hystrix的commandKey的超时时间。

   ```java
   @RestController
   public class FallbackController {
   
       @GetMapping("/fallbackA")
       public Response fallbackA() {
           Response response = new Response();
           response.setCode("100");
           response.setMessage("服务暂时不可用");
           return response;
       }
   }
   ```

##### 2.分布式限流

  令牌桶算法：系统按照恒定间隔速率向水桶里加入令牌（token），如果桶中令牌数达到上限，就丢弃令牌。每个请求进入都会拿走一个令牌，如果没有令牌可拿，就拒绝服务。

![img](http://www.qiniuyun.zhangzhendong.com/blog/image/1240-20240813195310226)

SpringCloud Gateway官方提供了RequestRateLimiterGatewayFilterFactory这个类，适用在Redis内的通过执行Lua脚本实现了令牌桶的方式。

pom.xml

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

application.yml

```yml
spring:
  cloud:
    gateway:
      routes:
      - id: limit_route
        uri: http://httpbin.org:80/get
        predicates:
        - After=2017-01-20T17:42:47.789-07:00[America/Denver]
        filters:
        - name: RequestRateLimiter
          args:
            # 使用SpEL表达式从Spring容器中获取Bean对象
            key-resolver: '#{@userKeyResolver}'
            # 令牌桶每秒填充平均速率
            redis-rate-limiter.replenishRate: 1
            # 令牌桶的上限
            redis-rate-limiter.burstCapacity: 3
```

这里根据用户ID限流，请求路径中必须携带userId参数

```java
//根据userId限流
@Bean
KeyResolver userKeyResolver() {
  return exchange -> Mono.just(exchange.getRequest().getQueryParams().getFirst("user"));
}

//根据ip限流
@Bean
public KeyResolver ipKeyResolver() {
  return exchange -> Mono.just(exchange.getRequest().getRemoteAddress().getHostName());
}

//根据URI限流
@Bean
KeyResolver apiKeyResolver() {
  return exchange -> Mono.just(exchange.getRequest().getPath().value());
}
```

keyResolver需要实现resolve方法，比如根据userid进行限流，则需要用userid去判断。实现完KeyResolver之后，需要将这个类的Bean注册到Ioc容器中。

##### 测试

持续高速访问某个路径，速度过快时，返回 `HTTP ERROR 429` 。