import { Context } from 'koa'
import {
  body,
  middlewares,
  responses,
  routeConfig,
} from 'koa-swagger-decorator'
import jwt from 'jsonwebtoken'
import {
  CreateUserReq,
  CreateUserRes,
  DeleteUserQuery,
  DeleteUserRes,
  IDeleteUserQuery,
  UserLoginRes,
} from './type'
import { ParsedArgs, z } from 'koa-swagger-decorator'
import { ICreateUserReq } from '@/controller/User/type'
import User from '@/schema/user'
import UserLevel from '@/schema/userLevel'
import { ctxBody, deleteByIdMiddleware, paginationMiddleware } from '@/utils'
import { paginationQuery } from '@/controller/common/queryType'

class UserController {
  @routeConfig({
    method: 'post',
    path: '/user/create',
    summary: '创建用户',
    tags: ['用户'],
  })
  @body(CreateUserReq)
  @responses(CreateUserRes)
  @middlewares([
    async (ctx: Context, next: any) => {
      // 可以对ctx进行操作,然后放行
      await next()
    },
  ])
  async CreateUser(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    try {
      // 查找默认用户等级
      const defaultUserLevel = await UserLevel.findOne({
        where: {
          levelValue: 1,
          isAdmin: false,
        },
      })

      if (!defaultUserLevel) {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: '系统错误：未找到默认用户等级',
          data: null,
        })
        return
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({
        where: {
          userName: args.body.userName,
        },
      })

      if (existingUser) {
        ctx.body = ctxBody({
          success: false,
          code: 400,
          msg: '用户名已存在',
          data: null,
        })
        return
      }

      // 创建用户
      const user = await User.create({
        userName: args.body.userName,
        password: require('md5')(args.body.password),
        email: args.body.email,
        userLevelId: defaultUserLevel.id,
      })

      ctx.body = ctxBody({
        success: true,
        code: 200,
        msg: '创建用户成功',
        data: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      ctx.body = ctxBody({
        success: false,
        code: 500,
        msg: '创建用户失败：' + (error.message || '未知错误'),
        data: null,
      })
    }
  }

  @routeConfig({
    method: 'get',
    path: '/user/list',
    summary: '用户列表',
    tags: ['用户'],
    request: {
      query: paginationQuery(),
    },
  })
  @responses(CreateUserRes)
  async getUserList(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    await paginationMiddleware(ctx, User, '查询用户列表')
  }

  @routeConfig({
    method: 'delete',
    path: '/user/delete',
    summary: '删除指定用户',
    tags: ['用户'],
    request: {
      query: DeleteUserQuery,
    },
  })
  @responses(DeleteUserRes)
  async deleteUser(ctx: Context, args: ParsedArgs<IDeleteUserQuery>) {
    await deleteByIdMiddleware(ctx, User, '用户')
  }

  @routeConfig({
    method: 'post',
    path: '/user/login',
    summary: '用户登录',
    tags: ['用户', '登录'],
  })
  @body(CreateUserReq)
  @responses(UserLoginRes)
  async login(ctx: Context, args: ParsedArgs<ICreateUserReq>) {
    args.body.password = require('md5')(args.body.password)
    await User.findOne({
      where: {
        userName: args.body.userName,
        password: args.body.password,
      },
    })
      .then(res => {
        // 生成 token,设置有效期
        const token = jwt.sign(
          {
            id: res.dataValues.id,
            userName: res.dataValues.userName,
            email: res.dataValues.email,
          },
          // 建议将密钥存储在环境变量中
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        ctx.body = ctxBody({
          success: true,
          code: 200,
          msg: '登录成功',
          data: {
            ...res.dataValues,
            token,
          },
        })
      })
      .catch(e => {
        ctx.body = ctxBody({
          success: false,
          code: 500,
          msg: '登录失败',
          data: e,
        })
      })
  }
}

export { UserController }
