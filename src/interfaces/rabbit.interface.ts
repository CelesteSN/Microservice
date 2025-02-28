



export interface IPropsConsumer{
    exchange: string,
    queue: string,
    routingKey: string
}

export interface IPropsLogoutConsumer{
    exchange: string
}

export interface IRabbitMessage{
    type: string,
    message: any
}

export interface IRabbitFunction {
    (source: IRabbitMessage): void;
}