package com.learningen;

import java.awt.image.BufferedImage;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.MessageDigest;
import java.util.HexFormat;

final class ImageOrientation {
    private ImageOrientation() {}
    static int read(byte[] jpeg) {
        if(jpeg.length<4 || (jpeg[0]&255)!=255 || (jpeg[1]&255)!=216) return 1;
        int offset=2;
        while(offset+4<=jpeg.length && (jpeg[offset]&255)==255) {
            int marker=jpeg[offset+1]&255;
            if(marker==218 || marker==217) break;
            int size=((jpeg[offset+2]&255)<<8)|(jpeg[offset+3]&255);
            if(size<2 || (long)offset+2+size>jpeg.length) break;
            int start=offset+4,end=offset+2+size;
            if(marker==225 && start+14<=end && jpeg[start]=='E' && jpeg[start+1]=='x' && jpeg[start+2]=='i' && jpeg[start+3]=='f' && jpeg[start+4]==0 && jpeg[start+5]==0) {
                int tiff=start+6;
                boolean little=jpeg[tiff]=='I' && jpeg[tiff+1]=='I';
                if(!little && !(jpeg[tiff]=='M' && jpeg[tiff+1]=='M')) return 1;
                ByteBuffer data=ByteBuffer.wrap(jpeg).order(little?ByteOrder.LITTLE_ENDIAN:ByteOrder.BIG_ENDIAN);
                if(Short.toUnsignedInt(data.getShort(tiff+2))!=42) return 1;
                long directory=tiff+Integer.toUnsignedLong(data.getInt(tiff+4));
                if(directory<tiff+8 || directory+2>end) return 1;
                int count=Short.toUnsignedInt(data.getShort((int)directory));
                for(int i=0;i<count;i++) {
                    long entry=directory+2+(long)i*12;
                    if(entry+12>end) return 1;
                    int p=(int)entry;
                    if(Short.toUnsignedInt(data.getShort(p))==0x112 && Short.toUnsignedInt(data.getShort(p+2))==3 && data.getInt(p+4)==1) {
                        int value=Short.toUnsignedInt(data.getShort(p+8));
                        return value>=1 && value<=8?value:1;
                    }
                }
            }
            offset=end;
        }
        return 1;
    }
    static BufferedImage apply(BufferedImage source,int orientation) {
        if(orientation<=1 || orientation>8) return source;
        int width=source.getWidth(),height=source.getHeight();
        var target=new BufferedImage(orientation>=5?height:width,orientation>=5?width:height,BufferedImage.TYPE_INT_RGB);
        for(int y=0;y<height;y++) for(int x=0;x<width;x++) {
            int dx=x,dy=y;
            switch(orientation) {
                case 2 -> dx=width-1-x;
                case 3 -> { dx=width-1-x;dy=height-1-y; }
                case 4 -> dy=height-1-y;
                case 5 -> { dx=y;dy=x; }
                case 6 -> { dx=height-1-y;dy=x; }
                case 7 -> { dx=height-1-y;dy=width-1-x; }
                case 8 -> { dx=y;dy=width-1-x; }
                default -> { }
            }
            target.setRGB(dx,dy,source.getRGB(x,y));
        }
        return target;
    }
    static String digest(BufferedImage image) throws Exception {
        var digest=MessageDigest.getInstance("SHA-256");
        digest.update(ByteBuffer.allocate(8).putInt(image.getWidth()).putInt(image.getHeight()).array());
        var row=ByteBuffer.allocate(image.getWidth()*4);
        for(int y=0;y<image.getHeight();y++) {
            row.clear();
            for(int x=0;x<image.getWidth();x++) row.putInt(image.getRGB(x,y));
            digest.update(row.array());
        }
        return HexFormat.of().formatHex(digest.digest());
    }
}
