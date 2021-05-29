class LikesController < ApplicationController

     before_action :authenticate_user
    
    def create
        # 変数@likeを定義してください
        @like = Like.new(
          user_id: @current_user.id,
          post_id: params[:post_id]
        )
        
        # 変数@likeを保存してください
        @like.save
        
        # 投稿詳細ページにリダイレクトしてください
        redirect_to("/posts/#{params[:post_id]}")
    end

    def destroy
        @like = Like.find_by(
          user_id: @current_user.id,
          post_id: params[:post_id]
        )
        @like.destroy
        redirect_to("/posts/#{params[:post_id]}")
    end
    
  end