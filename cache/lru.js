
class Node{
    constructor(key,value,size){
        this.key = key;
        this.value=value;
        this.size = size;
        this.next = null;
        this.prev = null;
    }
}

class lruCache{
    constructor(){
        this.cache = new Map();
        this.head = new Node(null,null,0);
        this.tail = new Node(null,null,0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.maxBytes = 300 * 1024 * 1024; 
        this.currentBytes = 0;

    }

    //add
    add(node){
        const nextNode = this.head.next;
        this.head.next = node;
        node.prev=this.head;
        node.next = nextNode;
        nextNode.prev=node;
        
    }

    //remove
    remove(node){
        const prevNode = node.prev;
        const nextNode = node.next;
        prevNode.next = nextNode;
        nextNode.prev = prevNode;
    }

    //get
    get(key){
        if(!this.cache.has(key)){
            return null;
        }
        const node = this.cache.get(key);
        this.remove(node);
        this.add(node);
        return node.value;
    }

    // circular reference:
    // const a = {};
    // a.self = a;

    roughSize(value){
    try{
        if (typeof value === "string") {
            return Buffer.byteLength(value);
        }
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        return Buffer.byteLength(JSON.stringify(value));
    }catch{
        
        return 1024; 
    }
}


    //put
    put(key,value){
        const valueSize = this.roughSize(value);
        const nodeSize = valueSize + Buffer.byteLength(String(key))+120;
        
        if(nodeSize > this.maxBytes) return;

        if(this.cache.has(key)){
            const node = this.cache.get(key);
            this.remove(node);
            this.currentBytes -= node.size;
            this.cache.delete(node.key);
        }
        
        while(this.currentBytes+nodeSize > this.maxBytes){
            const lruNode = this.tail.prev;

            if(lruNode === this.head) break;

            this.remove(lruNode);
            this.cache.delete(lruNode.key);
            this.currentBytes-=lruNode.size;
        }

        const newNode = new Node(key,value,nodeSize);
        this.add(newNode);
        this.cache.set(key,newNode);
        this.currentBytes+=nodeSize;
        console.log((this.currentBytes/1024/1024).toFixed(2), "MB");

    }
}

export default lruCache;